import React from "react";
import { render } from "react-dom";
import InputRange from 'react-input-range';

import Select from "react-select";
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
      select2: undefined,
      duration:{ },
     loading:true
    };
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
  return Promise.all([this.fetchagent(), this.fetchduration()])
}
getcalls = () =>{
  let opts = {"info":{"filter_agent_list":this.state.filteredagents,"filter_time_range":[this.state.value.min,this.state.value.max]}};
  console.log() 
  return fetch("https://damp-garden-93707.herokuapp.com/getfilteredcalls",{
    method: 'post',
      body: JSON.stringify(opts)
  })
  .then(res => res.json())
}
componentDidMount() {
  this.state.loading = true;
  this.getagentsandduration()
  .then(([agents, durations]) => {
    this.state.data = agents.data.listofagents;
    this.state.filteredagents = agents.data.listofagents;
    this.state.duration.min = durations.data.minimum;
    this.state.duration.max = durations.data.maximum;
    this.state.value.min = durations.data.minimum;
    this.state.value.max = durations.data.maximum;
    
    

    this.getcalls()
    .then((calls) => {
      this.state.tabledata = calls.data;
      console.log(this.state.tabledata);
      this.state.loading = false;
      this.forceUpdate();
    });




      
    
  })
    
}

  render() {
    const { data } = this.state;
    let loadingdiv = '';
    if (this.state.loading) {
      loadingdiv = <div className="loadingcontainer"> <div className="loader"></div> Loading and Syncing data...</div>;
    }
    return (
      <div>
       {loadingdiv}
        Filter By Agents
        <Select
          style={{ width: "50%", marginBottom: "20px", marginTop: "20px" }}
          onChange={entry => {
            this.setState({ select2: entry });
            console.log(entry);
            this.state.filteredagents = [];
            entry.map((item)=>{
              this.state.filteredagents.push(item.value);
            });
            this.state.loading = true;
            this.getcalls()
            .then((calls) => {
              this.state.tabledata = calls.data;
              console.log(this.state.tabledata);
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
          console.log(this.state.value);
          this.getcalls()
    .then((calls) => {
      this.state.tabledata = calls.data;
      console.log(this.state.tabledata);
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
    );
  }
}

render(<App />, document.getElementById("root"));
