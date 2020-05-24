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
    var result = await fetch("data/PCOD.txt");
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
          <textarea value={this.state.data} id="txtData"></textarea>
        </p>
        <button onClick={() => this.copyText()}>Copy text</button>
      </div>
    );
  }
}

export default App;
