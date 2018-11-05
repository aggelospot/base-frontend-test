<template>
  <!-- prevent the page from loading until the JSON has been retrieved -->
  <div class="readingValues" v-if="loaded"> 
    <!-- Render the select button -->
    <div id="vSelect">
      <vue-single-select
            :name="'as'" 
            v-model="timeFrameTrigger"
            :options="['Last 6 hours','Last 12 hours','Last day']"
            :placeholder="'Select a timeframe.'"
            :maxHeight ="'1000'"
            :required="true"
      ></vue-single-select>
    </div>
    <!-- Render the Chart component-->
    <ReadingsChart 
      v-bind:readings="readings"
      v-bind:valueType="valueType"
      v-bind:index="val_index"
      v-bind:update="update"
    />
    <!-- Render the readings table -->
    <ul>
      <div class="info">
        <li id="dt"> Date/time </li>
        <li id="v1"> Value 1 </li>
        <li id="v2"> Value 2 </li>
        <br>
      </div>
      <!-- Iterate through the readings array and render the following code [readings.length] times -->
      <div class="valuesbox" v-for="(values, index) in readings" :key='index'>

          <template v-if="values.timestamp">
          <!-- Date/Time column -->
            <div class="time">{{values.timestamp}}</div>

            <!-- Value 1 column -->
            <form @submit.prevent="addValue(values.value1, index, values.id, 1)"> 
              <div class="value1">
                  <li>
                    <!-- Change the label element to input when it is clicked (note to self: https://jsfiddle.net/ppyeo1tg/611/)-->
                    <input v-if = "edit == 1" v-model = "values.value1"
                    @blur= "edit = 0"
                    @keyup.enter = "edit=0; value=$event.target.value">
                    <div v-else>
                      <label @click = "edit = 1;"> {{values.value1}} </label>
                    </div>
                  </li>
              </div>
            </form>

            <!-- Value 2 column -->
            <form @submit.prevent="addValue(values.value2, index, values.id, 2)"> 
              <div class="value2">
                  <li>
                    <!-- Change the label element to input when it is clicked -->
                    <input v-if = "edit == 2" v-model = "values.value2"
                    @blur= "edit = 0"
                    @keyup.enter = "edit=0">
                    <div v-else>
                      <label @click = "edit = 2"> {{values.value2}} </label>
                    </div>
                  </li>
              </div>
            </form>
          </template>
      </div>  
    </ul>

  </div>
  
</template>

<script>
import ReadingsChart from '@/components/ReadingsChart.vue'
import Vue from 'vue'
import singleSelect from 'vue-single-select'
import JQuery from 'jquery'
let $ = JQuery
var moment = require('moment');
moment().format();

Vue.component('vue-single-select', singleSelect);


//importing 'axios' an http client to handle requests.
const axios = require('axios');


export default {
  name: 'ReadingsData',
  props: {
    msg: String
  },
  components:{
    singleSelect
  },
  created(){
    //Construct the query:
    let query = this.constructQuery(6);
    console.log("query is " + query);
    
    this.getJSONfile(query);
  },
  data: function(){
    
    return {
      last6: [],
      last12: [],
      last24: [],
      //val_index & valueType: Send to the ReadingsChart component when the users updates a value.
      val_index: '',
      valueType: 0,

      //update: used to trigger updating of the chart, value doesn't matter as long as it changes.
      update: false,

      //'edit': Bound to a label element, changes it's value depending on what the user clicked.
      //Possible values(int):     0 ? 1 ? 2    ||   No edit ? edit value 1 ? edit value 2
      edit: 0,

      //'timeFrame' / 'timeFrameTrigger': used for the select button
      timeFrameTrigger: 'Last 6 Hours',
      timeFrame: 6,

      //'loaded': used to prevent the page from rendering until the JSON is retrieved from the server.
      loaded: false

      //Used to save the readings so the maximum amount of queries the user can do before reloading the whole page is 3.
      
    }
  },
  watch: {
    timeFrameTrigger: {
      handler: function(newVal){      //note to self: dont use ES6 syntax for this, because 'this' doesnt work.
        if (newVal != null){
          if (newVal == "Last 6 hours"){
            this.timeFrame = 6;
            this.updateTimeFrame(6);
          }
          else if (newVal == "Last 12 hours"){
            this.timeFrame = 12;
            this.updateTimeFrame(12);
          }
          else if (newVal == "Last day"){
            this.timeFrame = 24;
            this.updateTimeFrame(24);
          }
        }
      }
    }
  },
  methods: {
    //Updates the chart when a value has been modified by the user.
    addValue(value, index, id, type){
      this.update = !this.update;
      this.valueType = type;
      this.val_index = index;
    },

    updateTimeFrame(timeframe){
      //this. readings = JSON.parse(JSON.stringify(this.readings));
      console.log("Timeframe is: " + timeframe);
      this.readings = {};
      if (timeframe == 6){
        this.readings = this.last6;
        this.update = !this.update;
      }
      else if(timeframe == 12){
        if (this.last12.length == 0){
          this.getJSONfile(this.constructQuery(timeframe));
        }
        else{
          this.readings = this.last12;
          this.update = !this.update;
        }
      }
      else if (timeframe == 24){
        if (this.last24.length == 0){
          this.getJSONfile(this.constructQuery(timeframe));
        }
        else{
          this.readings = this.last24;
          this.update = !this.update;
        }
      }
      
      this.valueType = 0;
      
    },

    constructQuery(hours){
      //Using moment.js to construct the timestamps for the query.
      var dateTime = new Date();
      
      //Get the readings for the last 6 hours.
      var start_date = moment(dateTime).subtract(hours, 'hours');
      start_date = moment(start_date).format("YYYY-MM-DDTHH:mm:00");
      
      
      //dateTime = moment(dateTime).subtract(5, 'minutes');
      dateTime = moment(dateTime).format("YYYY-MM-DDTHH:mm:00");
      
      return 'http://localhost:8081/reading?start=' + start_date + '&end=' + dateTime;
    },

    //get JSON file.
    getJSONfile(query){
      //using axios to retrieve the json object
      axios.get(query)
        .then( (response) => {
          console.log("retrieval successful");
          const readResponse = response.data
          this.readings = readResponse; //note: this.readings is not initialized in data(), but is created here.

          this.loaded = true;
          this.reFormatReadings(); //Delete a lot of the data so the page is not overwhelming to the eye.

          //Save the readings to these variables so we don't have to query the server again.
          if (this.timeFrame == 6) {
            this.last6 = JSON.parse(JSON.stringify(this.readings));
          }
          else if( this.timeFrame == 12){
            this.last12 = JSON.parse(JSON.stringify(this.readings));
          }
          else if( this.timeFrame == 24){
            this.last24 = JSON.parse(JSON.stringify(this.readings));
          }

        })
        .catch((response) => {
          console.log("Error " + response);
          error(response.status, response.data.description)
        });
        
        
    },
    //Update the JSON file to only show 1 reading every 30 minutes (averaging all the readings in between), depending on the timeframe (6/12/24 hours).
    //If the server had an API that let me import readings in a different way (such as: every 30 minutes, average readings of x time etc) this function would not be needed.
    reFormatReadings(){
      console.log("reformat : ");
      console.log(this.readings);

      var condition_1 = moment(this.readings[0].timestamp).format("mm");
      var condition_2 = moment(this.readings[0].timestamp).add(30, "minutes");
      condition_2 = moment(condition_2).format("mm");
      var compare = '';
      var avg1 = 0, avg2 = 0;

      for (var i = 0; i < this.readings.length; i++){
        compare = moment(this.readings[i].timestamp).format("mm");
        avg1 += this.readings[i].value1;
        avg2 += this.readings[i].value2;
        //Cut all the readings for the next 29 minutes
        if (compare != condition_1 && compare != condition_2){
          this.readings.splice(i, 1);
          i--;
        }
        //If it is the 30th minute, average the readings in between, and also reformat the time to be more user friendly.
        else{
          this.readings[i].value1 = avg1 / 30; 
          avg1 = 0;
          this.readings[i].value2 = avg2 / 30; 
          avg2 = 0;
          this.readings[i].timestamp = moment(this.readings[i].timestamp).format("HH:mm");
        }
      }
      this.update = !this.update;
    },

    convertTime(index){
      return this.readings[index].timestamp = moment(this.readings[index].timestamp).format("HH:mm");
    }
  },
  components: {
    ReadingsChart
  }
  
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
form {
  margin: auto;
  position: relative;
}
.valuesbox{
  border: 0.1px solid black;
  width: 100%;
  overflow: hidden;

}
.input{
  text-align: center;
}
.even_divs{
  margin: auto;
  width: 100%;
  background-color: red;
  width: 1450px;
}

.odd_divs{
  margin: auto;
  width: 100%;
  background-color: black;
  width: 1450px;
}

input {
  width: 50px;
  height: 25px;
}

h3 {
  margin: 40px 0 0;
}
ul {
  position: center;
  list-style-type: none;
  padding: 0;
  background-color: floralwhite;
  border: 1.5px solid gray;
  width: 1480px;
  margin: auto;
}
li {
  display: inline-block;
  margin: 0 10px;
}

.time {
  height: 37px;
  width: 200px;
  float: left;
}

.info{
  background-color: #323333;
  color: #687F7F;
  border: 1.5px red;
}
.value1 {
  color: black;
  height: 37px;
  width: 625px;
  float: left;
}

.value2{
  color: black;
  height: 37px;
  width: 625px;
  float: right;
}
#dt{
  text-align: center;
  color: white;
  float: left;
  margin: 0 65px 0;
}

#v1{
  color: white;
  float: left;
  margin: 0 285px 0;
}
.time{
  color: black;
}

#v2{
  color: white;
  float: right;
  margin: 0 285px 0;
}
#vSelect{
  width: 200px;
  margin: 0 1435px 0;
}
a {
  color: #42b983;
}
</style>


<!-- old way
<div class="valuesbox" v-for="(values, index) in readings" :key='index'>

          <template v-if="(index+1) % 2 != 0">
            <div class="time">time</div>
            <form @submit.prevent="addValue(values.id, 1)"> 
              <div class="value1">
                  <li>
                    <input v-if = "values.edit" v-model = "values.title"
                    @blur= "values.edit = false"
                    @keyup.enter = "values.edit=false">
                    <div v-else>
                      <label @click = "values.edit = true;"> {{values.value1}} </label>
                    </div>
                  </li>
              </div>
            </form>
            <form @submit.prevent="addValue(values.id, 2)"> 
              <div class="value2">
                  <li>
                    <input v-if = "values.edit" v-model = "values.title"
                    @blur= "values.edit = false"
                    @keyup.enter = "values.edit=false">
                    <div v-else>
                      <label @click = "values.edit = true;"> {{values.value2}} </label>
                    </div>
                  </li>
              </div>
            </form>
          </template>
        
          <template v-else>
            <div class="time">time2</div>
      
            <form @submit.prevent="addValue"> 
              <div class="value1">
                  <li><input type="text" :value="values.value1" name="valuefield"></li>
              </div>
            </form>

            <form @submit.prevent="addValue"> 
              <div class="value2">
                  <li><input type="text" :value="values.value2" name="valuefield"></li>
              </div>
            </form>
          </template>


  //Get the current date
      var curr_date = (new Date())  //UTC format
                .toISOString()      //Conversion to ISO format
                .slice(0, -5);      //Trimming the last 5 digits (ex trimming '.001Z' to be replaced with ':00')
      curr_date += ':00';

      var current_hour = curr_date[11] + curr_date[12];

      var hour = Number(current_hour) - 6;
      if (hour < 0) hour = 24 + hour;
      if (hour < 10) hour = '0' + String(hour);

      //Curr_date: current date in ISO. 
      //Date_querry: curr_date minus 6 hours.
      var start_date = curr_date;
      start_date = curr_date.replace(String(Number(hour)+6), hour);

-->