;(function() {
  const {
    solactive_data,
    // admin_ajax,
    // site_url,
    // plugin_slug
  } = wp_data;
  
  const {
    body,
    response,
    query,
    errors,
  } = solactive_data;
  
console.log(query)

  const errorMsg = document.getElementById('g-charts-error')
  let error = null
  
  const setError = val => errorMsg.innerHTML = val
  
  // all good?
  if (!response || response.code !== 200 || !!errors) {
    error = 'Solactive API error';
    setError(error);
    throw new Error();
  }
  if (body === '[ ]') {
    error = 'No data found';
    setError(error)
    throw new Error(error);
  }
  
  Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  });

  // yep, let's go
  const data = JSON.parse(body);
  const ctx = document.getElementById('g-chart').getContext('2d');
  const indexID = document.getElementById('indexID');
  const resolutionInput = document.getElementById('resolution');
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');

  fromInput.value = new Date(query.from).toDateInputValue()
  toInput.value = new Date(query.to).toDateInputValue()

  const labels = data.map(d => new Date(d.timestamp).toUTCString());
  const values = data.map(d => d.value);

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(1, 'rgba(232,243,239,.4)');   
  gradient.addColorStop(0, 'rgba(154,221,118,1)');
  
  const gChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Index value',
        data: values,
        backgroundColor: gradient,
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
        // borderWidth: 1,
      }]
    },
  })  
})();