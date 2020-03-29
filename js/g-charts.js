const { solactive_data } = wp_data;
const { body, response, errors} = solactive_data;

const errorMsg = document.getElementById('g-charts-error')
let error = null

const setError = val => errorMsg.innerHTML = val

// all good?
if (!response || response.code !== 200) {
  error = 'Error: Solactive server error';
  setError(error);
  throw new Error();
}

console.log(body)
if (body === '[ ]') {
  error = 'Error: No Solactive data found';
  setError(error)
  throw new Error(error);
}

// yep, let's go
const data = JSON.parse(body);
const ctx = document.getElementById('g-chart').getContext('2d');
const indexID = document.getElementById('indexID');
const labels = data.map(d => d.timestamp);
const values = data.map(d => d.value);

indexID.innerText = data[0].indexId;

const gChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
      datasets: [{
          label: 'Index value',
          data: values,
          // backgroundColor: [
          //     'rgba(255, 99, 132, 0.2)',
          //     'rgba(54, 162, 235, 0.2)',
          //     'rgba(255, 206, 86, 0.2)',
          //     'rgba(75, 192, 192, 0.2)',
          //     'rgba(153, 102, 255, 0.2)',
          //     'rgba(255, 159, 64, 0.2)'
          // ],
          // borderColor: [
          //     'rgba(255, 99, 132, 1)',
          //     'rgba(54, 162, 235, 1)',
          //     'rgba(255, 206, 86, 1)',
          //     'rgba(75, 192, 192, 1)',
          //     'rgba(153, 102, 255, 1)',
          //     'rgba(255, 159, 64, 1)'
          // ],
          // borderWidth: 1
      }]
  },
})

