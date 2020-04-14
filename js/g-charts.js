;(function() {
  Date.prototype.toDateInputValue = (function() {
    let local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  });

  const { solactive_data, ajax_url } = wp_data;
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const errorMsg = document.getElementById('g-charts-error');

  const margin = {top: 10, right: 10, bottom: 100, left: 40},
        margin2 = {top: 430, right: 10, bottom: 20, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;

  let data = null;
  let error = null;

  const parseDate = d3.time.format("%s").parse;

  const setError = val => {
    errorMsg.innerHTML = val;
  }

  const dateFromTimestamp = ts => {
    const parts = new Date(ts).toUTCString().split(' ');
    const [dOw, d, m, y] = parts
    return `${dOw} ${m} ${d}, ${y}`;
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
    return JSON.parse(body);
  }

  const drawChart = () => {
    let x = d3.time.scale().range([0, width]),
        x2 = d3.time.scale().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        y2 = d3.scale.linear().range([height2, 0]);

    let xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");

    let brush = d3.svg.brush()
        .x(x2)
        .on("brush", brushed);

    let area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.timestamp); })
        .y0(height)
        .y1(function(d) { return y(d.value); });

    let area2 = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x2(d.timestamp); })
        .y0(height2)
        .y1(function(d) { return y2(d.value); });

    let svg = d3.select("#g-chart-d3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    let focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    let zoom = d3.behavior.zoom().scaleExtent([1,1000])
        .on("zoom", zoomed);
      
    let context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
      

    x.domain(d3.extent(data.map(function(d) { return d.timestamp; })));
    y.domain([0, parseFloat(d3.max(data.map(function(d) { return d.value; }))) + 30]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    zoom.x(x);

    focus.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis);
      
    focus.call(zoom);

    context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", height2 + 7);

    function brushed() {
      x.domain(brush.empty() ? x2.domain() : brush.extent());
      focus.select(".area").attr("d", area);
      focus.select(".x.axis").call(xAxis);
      let s = x.domain();
      let s_orig = x2.domain();
      let newS = (s_orig[1]-s_orig[0])/(s[1]-s[0]);
      let t = (s[0]-s_orig[0])/(s_orig[1]-s_orig[0]); 
      let trans = width*newS*t;
      zoom.scale(newS);
      zoom.translate([-trans,0]);
    }

    function zoomed() {
      let t = 	d3.event.translate;
      let s = 	d3.event.scale;
      let size = width*s;
      t[0] = Math.min(t[0], 0);
      t[0] = Math.max(t[0], width-size);
      zoom.translate(t);
      focus.select(".area").attr("d", area);
      focus.select(".x.axis").call(xAxis);
      //Find extent of zoomed area, what's currently at edges of graphed region
      let brushExtent = [x.invert(0), x.invert(width)];
      context.select(".brush").call(brush.extent(brushExtent));
    }

    function type(d) {
      d.timestamp = parseDate(d.timestamp);
      d.value = +d.value;
      return d;
    }
  };

  const handleDateChange = () => {
    const from = new Date(fromInput.value).getTime();
    const to = new Date(toInput.value).getTime();
    // ...
  };

  const init = () => {
    fromInput.addEventListener('change', handleDateChange);
    toInput.addEventListener('change', handleDateChange);
    fromInput.value = new Date(solactive_data.query.from).toDateInputValue();
    toInput.value = new Date(solactive_data.query.to).toDateInputValue();
    data = parseSolactiveData(solactive_data);
    if (data) {
      const dates = data.map(d => dateFromTimestamp(d.timestamp));
      document.getElementById('last-quote-date').innerText = dates[dates.length - 1];
      drawChart();
    }
  };

  init();

})();