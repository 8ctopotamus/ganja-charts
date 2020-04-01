;(function() {
  const {
    solactive_data,
    ajax_url,
  } = wp_data;
  
  const errorMsg = document.getElementById('g-charts-error')
  let error = null
  
  const setError = val => errorMsg.innerHTML = val
  

  // yep, let's go  
  Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  });

  const ctx = document.getElementById('g-chart').getContext('2d');
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  
  const drawChart = (data) => {
    const {
      body,
      response,
      query,
      errors,
    } = data;

    console.log(data)

    let chartData = JSON.parse(body);
    
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

    const labels = chartData.map(d => new Date(d.timestamp).toUTCString());
    const values = chartData.map(d => d.value);
  
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
        }]
      },
    })  
  }

  const handleDateChange = async () => {
    const url = new URL(ajax_url);
    const params = {
      action: 'g_charts_actions',
      from: new Date(fromInput.value).getTime(),
      to: new Date(toInput.value).getTime(),
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    fetch(url)
      .then(res => res.json())
      .then(json => drawChart(json));
  }

  fromInput.addEventListener('change', handleDateChange);
  toInput.addEventListener('change', handleDateChange);

  fromInput.value = new Date(solactive_data.query.from).toDateInputValue();
  toInput.value = new Date(solactive_data.query.to).toDateInputValue();
  drawChart(solactive_data);

})();