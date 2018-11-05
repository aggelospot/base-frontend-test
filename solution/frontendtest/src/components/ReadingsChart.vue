<template>
  <div id="graphArea" style="margin: auto; height:60vh; width:80vw">
    <canvas id="simpleChart" width="800" height="250"></canvas>
  </form>
  </div>
  
  
</template>

<script>
import Chart from 'chart.js';
import readingsChartData from '../chart-data.js';
var moment = require('moment');
moment().format();


export default {
  name: 'ReadingsComp',
  props: {
    msg: String
  },
  mounted() {
    this.createChart('Readings Chart', this.readingsChartData);
    this.readingsData = this.readings;
  },
  data() {
    return {
      readingsChartData: readingsChartData, //redundant
      chart: ''
    }
  },
  //Props of this child component:
  //'readings': the array with all the readings, {value1, value2, id, timestamp, edit}
  //'valueType': used to detect whether the user changed the value1 or value2 field.
  //'update': used to detect a submission event. Index: the index of the value that was changed.
  props:  ['readings', 'valueType', 'index', 'update'],

  watch: {
    //Watch for changes in the update variable, which means whenever the user edits a value, or requests readings from a different timeframe.
    update: {
      handler: function(newVal) {
        console.log("prop changed");
        this.updateChart();
      },
      deep: true, //useless, but i keep it for future reference. It checks for changes even if the variable we are watching is an object.
    }
  },
    
  methods: {
    //Called when the component is mounted, it creates the chart.
    createChart(chartId, chartData) {
      const ctx = document.getElementById('simpleChart').getContext("2d");
      console.log("creating chart with the following data");
      console.log(this.readings);
      this.readings.forEach((reading, index) => {
          chartData.data.datasets[0].data[index] = this.readings[index].value1;
          chartData.data.datasets[1].data[index] = this.readings[index].value2;
          chartData.data.labels[index] = this.readings[index].timestamp;
      })
      
      //Creates the chart
      const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options
      });
      //Save the chart for later use.
      this.chart = myChart;
    },
    importReadings(){
      console.log("updating chart with the following data");
      console.log(this.readings);

      //Sets the chart's value1, value2, and labels, with the data from the JSON object we retrieved.

      this.readings.forEach((reading, index) => {
          this.chart.data.datasets[0].data[index] = this.readings[index].value1;
          this.chart.data.datasets[1].data[index] = this.readings[index].value2;
          this.chart.data.labels[index] = this.readings[index].timestamp;
      })
      this.chart.update();
      
      
    },
    updateChart(){
      //Updates the chart.
      
      //This function is called when the 'watch' method of this component is triggered.

      const ctx = document.getElementById('simpleChart').getContext("2d");
      console.log("updating type " + this.valueType + " at index " + this.index );

      //Updates a specific value of the value1 or value2 array depending on what the user editted.
      if (this.valueType == 1){
        this.chart.data.datasets[0].data[this.index] = this.readings[this.index].value1;
        this.chart.update();
      }
      else if(this.valueType == 2){
        this.chart.data.datasets[1].data[this.index] = this.readings[this.index].value2;
        this.chart.update();
      }
    
      //If the user has requested readings from a different timeframe this block clears the value1, value2 and label arrays and fills them with the updated data, 
      else{
        console.log("clearing");
        this.chart.data.datasets[0].data.splice(0,this.chart.data.datasets[0].data.length);
        this.chart.data.datasets[1].data.splice(0,this.chart.data.datasets[0].data.length);
        this.chart.data.labels.splice(0,this.chart.data.labels.length);
        this.importReadings();
      }
    },
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#graphArea{
  background-color: white;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
<!-- Code i deleted but i might need in a later project:

+++declaring props:
['data]
data: {
      type: Array,
      required: true
    }
data: [
    {
        value1: Number,
        value2: Number,
        id: String,
        timestamp: String,
      }
    ]

+++how to console log JSON object properly in vue
  console.log(JSON.parse(JSON.stringify(chartData.data.datasets[0].data)));

+++update chart by push/pop
  updateData(chart, index) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
  }


  -->