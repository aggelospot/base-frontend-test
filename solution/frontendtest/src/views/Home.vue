<template>
  <div class="home">
    <ReadingsData />
  </div>
</template>

<script>
// @ is an alias to /src
//import ReadingsChart from '@/components/ReadingsChart.vue'
import ReadingsData from '@/components/ReadingsData.vue'

export default {
  name: 'home',
  components: {
    ReadingsData
  }
}
</script>


<!-- <img alt="Vue logo" src="../assets/logo.png"> -->