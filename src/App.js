import React, {Component} from 'react';
import {ScatterPlot} from 'react-d3-components';
import c6data, {DataOrganizer} from './data-organizer'
import './App.css';

const logo = 'http://www.chem.mun.ca/homes/cnrhome/group_page/images/memorial-university-logo.png';

class App extends Component {
  state = {
    forceFields: DataOrganizer.forceFields,
    forceField: '',
    atomTypes: null,
    atomType: ''
  };

  componentDidMount() {
    c6data
      .fetch()
      .then(() => {
        c6data.normalize();
        c6data.prepareAtomTypes();
      });
  }

  handleForceFieldChange(event) {
    const forceField = event.target.value;

    this.setState({
      forceField,
      atomType: '',
      atomTypes: c6data.atomTypes[forceField]
    });
  }

  handleAtomTypeChange(event) {
    const atomType = event.target.value;

    this.setState({atomType});
  }

  chartTooltip(x, y, {data}) {
    return `${data['Compound']}[${data['Atom Idx']}]`
  }

  renderChart() {
    const {forceField, atomType} = this.state;
    const values = c6data
      .atomTypes[forceField][atomType]
      .map(
        data => ({
          x: data[`C6_POSTG (Ha A^6)`],
          y: data[`C6_${forceField}`],
          data
        })
      );

    const data = {values};

    return (
      <ScatterPlot
        data={data}
        width={window.innerWidth - 100}
        height={window.innerHeight - 400}
        margin={{top: 10, bottom: 50, left: 50, right: 10}}
        tooltipHtml={this.chartTooltip}
        tooltipContained
        xAxis={{innerTickSize: 6, label: "C6 POSTG"}}
        yAxis={{label: `C6 ${forceField}`}}
      />
    );
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Rowley Group</h2>
          <h3>London Dispersion Coefficients</h3>
        </div>
        <p className="App-intro">
          <div className="control-group">
            <label htmlFor="forceField">Choose the Force Field: </label>

            <select
              id="forceField"
              value={this.state.forceField}
              onChange={this.handleForceFieldChange.bind(this)}
            >
              <option disabled key="null" value="">Choose a Force Field</option>
              {
                this.state.forceFields.map(
                  ff => <option key={ff} value={ff}>{ff}</option>
                )
              }
            </select>
          </div>
          {
            this.state.atomTypes ? (
              <div className="control-group">
                <label htmlFor="atomType">Choose the Atom Type:</label>
                <select
                  id="atomType"
                  value={this.state.atomType}
                  onChange={this.handleAtomTypeChange.bind(this)}
                >
                  <option disabled key="null" value="">Choose an Atom Type</option>
                  {
                    Object.keys(this.state.atomTypes).map(
                      type => <option key={type} value={type}>{type}</option>
                    )
                  }
                </select>
              </div>
            ) : null
          }
        </p>

        <div>
          {
            this.state.atomType !== '' && this.state.forceField !== '' ?
              this.renderChart() : null
          }
        </div>
      </div>
    );
  }
}

export default App;
