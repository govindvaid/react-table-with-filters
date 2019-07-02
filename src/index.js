import React from "react";
import { render } from "react-dom";
import InputRange from 'react-input-range';

import Select from "react-select";
// import CreatableSelect from 'react-select/creatable';
import "react-select/dist/react-select.css";
import "./index.css";
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import "react-input-range/lib/css/index.css";

class App extends React.Component {
  filterDuration;
  constructor() {
    super();
    
    this.state = {
      value: {},
      data: [],
      tabledata:[],
	  filteredagents: [],
	  filteredlabels: [],
	  select2: undefined,
	  selectlabel:undefined,
      duration:{},
	 loading:true,
	 isLoading:false,
	 selected:{}, 
	 selectAll:0, 
	 data1: [],
	 alllabels:[]
    };
    this.toggleRow = this.toggleRow.bind(this);
  }
toggleRow(index) {
  const newSelected = Object.assign({}, this.state.selected);
  newSelected[index] = !this.state.selected[index];
  this.setState({
    selected: newSelected,
    selectAll: 2
  });
}

toggleSelectAll() {
  let newSelected = {};

  if (this.state.selectAll === 0) {
    this.state.data1.forEach((x,index) => {
      newSelected[index] = true;
    });
  }

  this.setState({
    selected: newSelected,
    selectAll: this.state.selectAll === 0 ? 1 : 0
  });
}

fetchallcalls = () => {
  return fetch("https://damp-garden-93707.herokuapp.com/getcalllist",{
    headers: {
      'user_id': '24b456',
      'Content-Type': 'application/json'
  }
  })
  .then(res => res.json())
}
fetchallLabels = () => {
	return fetch("https://damp-garden-93707.herokuapp.com/getlistoflabels",{
	  headers: {
		'user_id': '24b456',
		'Content-Type': 'application/json'
	}
	})
	.then(res => res.json())
  }
fetchagent = () => {
  return fetch("https://damp-garden-93707.herokuapp.com/getlistofagents")
  .then(res => res.json())
  

}
fetchduration = () =>{
  return fetch("https://damp-garden-93707.herokuapp.com/getdurationrange")
  .then(res => res.json())
  
}
getagentsandduration = () =>{
  return Promise.all([this.fetchagent(), this.fetchduration(),this.fetchallcalls(),this.fetchallLabels()])
}
addNewLabel = (ids,labels) =>{
	let opts = {"operation":{"callList":ids,"label_ops":labels}};
	return fetch("https://damp-garden-93707.herokuapp.com/applyLabels",{
		headers: {
			'user_id': '24b456',
			'Content-Type': 'application/json'
		},
	  	method: 'post',
		body: JSON.stringify(opts)
	})
	.then(res => res.json())
  }

getcalls = () =>{
  let opts = {"info":{"filter_agent_list":this.state.filteredagents,"filter_time_range":[this.state.value.min,this.state.value.max]}};
  return fetch("https://damp-garden-93707.herokuapp.com/getfilteredcalls",{
    method: 'post',
      body: JSON.stringify(opts)
  })
  .then(res => res.json())
}

handleCreate = (inputValue) => {
    this.setState({ isLoading: true });
    console.group('Option created',inputValue);
    console.log('Wait a moment...');
    setTimeout(() => {
      const { alllabels } = this.state;
      const newOption = this.createOption(inputValue);
      console.log(newOption);
      
      this.setState({
        isLoading: false,
        alllabels: [...alllabels, newOption],
        value: newOption,
      });
    }, 1000);
  };
createOption = (label) => ({
	label,
	value: label
  });
applyselLabels = () =>{
	console.log("apply ",this.state.selected);
	var callidtobeadded=[];
	Object.keys(this.state.selected).map((item)=>{
		if(this.state.selected[item]){
			callidtobeadded.push(this.state.data1[item].call_id);
		}
	})
	console.log("classidtobeadded",callidtobeadded);
	console.log("this.state.filteredlabels",this.state.filteredlabels);
	
	let updateArr = [];
	this.state.filteredlabels.map((item)=>{
		updateArr.push({"name":item,"op":"add"})
	})
	this.addNewLabel(callidtobeadded,updateArr)
	.then((label) => {
	console.log("add updated success");
		this.fetchallcalls()
		.then((calls) => {
		this.state.data1 = calls.data.call_data;
		this.forceUpdate();
		});
	

	});


}  
componentDidMount() {
  this.state.loading = true;
  this.getagentsandduration()
  .then(([agents, durations, allcalls,alllabel]) => {
	this.state.alllabels = alllabel.data.unique_label_list;
    this.state.data = agents.data.listofagents;
    this.state.data1 = allcalls.data.call_data;
    this.state.filteredagents = agents.data.listofagents;
    this.state.duration.min = durations.data.minimum;
    this.state.duration.max = durations.data.maximum;
    this.state.value.min = durations.data.minimum;
    this.state.value.max = durations.data.maximum;
    
    

    this.getcalls()
    .then((calls) => {
      this.state.tabledata = calls.data;
      
      this.state.loading = false;
      this.forceUpdate();
    });




      
    
  })
    
}

  render() {
    const { data } = this.state;
    const columns = [
			{
				Header: "CALL INFO",
				columns: [
					{
						id: "checkbox",
						accessor: "",
						Cell: ({ original,index }) => {
							return (
								<input
									type="checkbox"
									className="checkbox"
									checked={this.state.selected[index] === true}
									onChange={() => this.toggleRow(index)}
								/>
							);
						},
						Header: x => {
							return (
								<input
									type="checkbox"
									className="checkbox"
									checked={this.state.selectAll === 1}
									ref={input => {
										if (input) {
											input.indeterminate = this.state.selectAll === 2;
										}
									}}
									onChange={() => this.toggleSelectAll()}
								/>
							);
						},
						sortable: false,
						width: 45
					},
					{
						Header: "CALL ID",
						accessor: "call_id"
					},
					{
						Header: "Call Labels",
						id:"labelId",
						accessor: data => {
							return <Select.Creatable
							onChange={entry => {
								let newLabels=[];
								entry.map((item)=>{
									newLabels.push(item.value);
								})
								
								if(newLabels.length>data.label_id){
									let difference = newLabels.filter(x => !data.label_id.includes(x)); // calculates diff
								
									let updateArr = [];
								
									difference.map((item)=>{
										updateArr.push({"name":item,"op":"add"})
									})
									this.addNewLabel([data.call_id],updateArr)
									.then((label) => {
									console.log("add updated success");
									});
								}
								else{
									let difference1 = data.label_id.filter(x => !newLabels.includes(x)); // calculates diff
									 
									let updateArr = [];
								
									difference1.map((item)=>{
										updateArr.push({"name":item,"op":"del"})
									})
									this.addNewLabel([data.call_id],updateArr)
									.then((label) => {
									console.log("del updated success");
									}); 
								}


								let temparr =[];
								entry.map((item)=>{temparr.push(item.value)});
								data.label_id=temparr;
								
								this.forceUpdate();
							  }}
							  value={data.label_id.map((o, i) => {
								return { value: o, label: o };
							  })}
							  multi={true}
							  className="tableselect"
							  options={this.state.alllabels.map((o, i) => {
								return { value: o, label: o };
							  })}
					
					
					
						  />;
						}
						
					}
				]
			}
		];
    let loadingdiv = '';
    if (this.state.loading) {
      loadingdiv = <div className="loadingcontainer"> <div className="loader"></div> Loading and Syncing data...</div>;
    }
    return (
      <div>
        <div className="margin-bottom-60">
        {loadingdiv}
          Filter By Agents
          <Select
            style={{ width: "50%", marginBottom: "20px", marginTop: "20px" }}
            onChange={entry => {
              this.setState({ select2: entry });
              this.state.filteredagents = [];
              entry.map((item)=>{
                this.state.filteredagents.push(item.value);
              });
              this.state.loading = true;
              this.getcalls()
              .then((calls) => {
                this.state.tabledata = calls.data;
                
                this.state.loading = false;
                this.forceUpdate();
              });
            }}
            value={this.state.select2}
            multi={true}
            options={this.state.data.map((o, i) => {
              return { id: i, value: o, label: o };
            })}
          />
          Filter By Duration
          <div style={{ padding: "20px", marginBottom: "20px" }}>
          <InputRange
          maxValue={this.state.duration.max}
          minValue={this.state.duration.min}
          value={this.state.value}
          onChange={value => {
            this.setState({ value })
            this.state.loading = true;
            
            this.getcalls()
      .then((calls) => {
        this.state.tabledata = calls.data;
        
        this.state.loading = false;
        this.forceUpdate();
      });
          }} />
          </div>
          <ReactTable
            data={this.state.tabledata}
            columns={[
              {
                Header: "Agents",
                columns: [
                  {
                    Header: "Name",
                    accessor: "agent_id"
                  }
                ]
              },
              {
                Header: "Call info",
                columns: [
                  {
                    Header: "Call Id",
                    accessor: "call_id"
                  },
                  {
                    Header: "call time",
                    accessor: "call_time",
                    
                  }
                ]
              }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          />
          
        </div>
        <div>
		<div className="margin-bottom-10">Choose labels to be applied to selected rows</div>
		<Select.Creatable
        isClearable
        isDisabled={this.state.isLoading}
		isLoading={this.state.isLoading}
		onCreateOption={input => {
			console.log("gopal");
		}}
        onChange={entry => {
			this.setState({ selectlabel: entry });
			this.state.filteredlabels = [];
			entry.map((item)=>{
			  this.state.filteredlabels.push(item.value);
			  
			});
			
		  }}
		  value={this.state.selectlabel}
		  className="width50"
		  multi={true}
		  options={this.state.alllabels.map((o, i) => {
			return { id: i, value: o, label: o };
		  })}



      />
	  
	  <button className="btn btn-primary" onClick={this.applyselLabels}>Apply labels to selected rows</button>
        <ReactTable
					data={this.state.data1}
					columns={columns}
          defaultSorted={[{ id: "call_id", desc: false }]}
          defaultPageSize={10}
          className="-striped -highlight positionabs"
				/>
          </div>
        </div>
    );
  }
}

render(<App />, document.getElementById("root"));
