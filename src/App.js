import React, { Component } from "react";
import "./App.css";

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPlan: "-- select --",
      data: "",
    };
  }

  async selectPlan(event) {
    var value = event.target.value;

    if (value === "-- select --") {
      alert("select plan");
      return false;
    }
    var url = `data/${event.target.value}.txt`;
    var result = await fetch(url);
    var data = await (await result).text();
    this.setState({
      data: data,
    });
  }

  async copyText() {
    var data = document.getElementById("txtData");
    data.select();
    document.execCommand("copy");
  }

  async onPlanChange(event) {
    var value = event.target.value;
    this.setState({
      data: value,
    });
  }

  render() {
    const plans = [
      "-- select --",
      "Diabetes",
      "PCOD",
      "Thyroid",
      "Heart",
      "Pregnancy",
      "Lectation",
      "Renal",
      "Renal Stone",
      "Liver",
      "Gluten Free",
      "Arthritis",
      "Asthma",
      "2000 KCal",
      "1200 KCal",
      "1800 KCal",
      "1600 KCal",
    ];

    return (
      <div className="App">
        <h2>Diet Plans - Dietitian Jyoti</h2>
        <p>Select Plan</p>
        <p>
          <select
            className="plans"
            id="plans"
            name="plans"
            onChange={(event) => this.selectPlan(event)}
          >
            {plans.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </p>
        <p>
          <textarea
            defaultValue={this.state.data}
            id="txtData"
            onChange={(event) => this.onPlanChange(event)}
          ></textarea>
        </p>
        <button onClick={() => this.copyText()}>Copy text</button>
        <br /> <br />
        {this.state.data && (
          <pre>
            <code>{this.state.data}</code>
          </pre>
        )}
      </div>
    );
  }
}

export default App;
