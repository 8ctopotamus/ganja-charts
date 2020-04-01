;(function() {

  Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  });

  const {
    solactive_data,
    ajax_url,
  } = wp_data;
  
  const canvas = document.getElementById('g-chart');
  const ctx = canvas.getContext('2d');
  const loading = document.getElementById('g-charts-loading');
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const errorMsg = document.getElementById('g-charts-error');
  let error = null;
  
  const setLoading = bool => bool 
    ? loading.style.display = 'block' 
    : loading.style.display = 'none';

  const setError = val => {
    errorMsg.innerHTML = val;
    val ? canvas.style.display = 'none'
        : canvas.style.display = 'block';
  }

  const dateFromTimestamp = ts => {
    const parts = new Date(ts).toUTCString().split(' ');
    const [dOw, d, m, y] = parts
    return `${dOw} ${m} ${d}, ${y}`;
  }
  
  const drawChart = (data) => {
    const labels = data.map(d => dateFromTimestamp(d.timestamp));
    const values = data.map(d => d.value);
  
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(1, 'rgba(232,243,239,.4)');   
    gradient.addColorStop(0, 'rgba(154,221,118,1)');

    const gChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Value',
          data: values,
          backgroundColor: gradient,
        }]
      },
    });
  }

  const parseSolactiveData = (solactive_data) => {
    const {
      body,
      response,
      query,
      errors,
    } = solactive_data;

    if (!response || response.code !== 200 || !!errors) {
      error = 'Solactive API error';
      setError(error);
      throw new Error();
    } else if (body === '[ ]') {
      error = 'No results';
      setError(error);
      throw new Error(error);
    }
    
    drawChart(JSON.parse(body));
  }
  
  const handleDateChange = () => {
    setLoading(true);
    const url = new URL(ajax_url);
    const params = {
      action: 'g_charts_actions',
      from: new Date(fromInput.value).getTime(),
      to: new Date(toInput.value).getTime(),
    };
    Object.keys(params)
      .forEach(key => url.searchParams.append(key, params[key]));
    fetch(url)
      .then(res => res.json())
      .then(json => {
        setLoading(false);
        setError(null);
        parseSolactiveData(json);
      })
      .catch(err => console.error(err));
  }

  fromInput.addEventListener('change', handleDateChange);
  toInput.addEventListener('change', handleDateChange);

  fromInput.value = new Date(solactive_data.query.from).toDateInputValue();
  toInput.value = new Date(solactive_data.query.to).toDateInputValue();
  parseSolactiveData(solactive_data);

})();