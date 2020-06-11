;(function() {
  Date.prototype.toDateInputValue = (function() {
    let local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  });

  const { solactive_data } = wp_data;
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

  // const parseDate = d3.time.format("%s").parse;
  const bisectDate = d3.bisector(function(d) { return d.timestamp; }).left;

  const setError = val => {
    errorMsg.innerHTML = val;
  }

  function calcTimeOffset(offset, ts) {
    d = new Date(ts)
    utc = d.getTime() + (d.getTimezoneOffset() * 60000) + (3600000 * offset)
    return utc
  }

  calcTimeOffset('-2', 1591905072607) // give correct


  const dateFromTimestamp = ts => {
    const parts = new Date(ts).toUTCString().split(' ');
    const [dOw, d, m, y] = parts
    return `${dOw} ${m} ${d}, ${y}`;
  }

  const parseSolactiveData = (solactive_data) => {
    if (!solactive_data) {
      error = 'No Solactive data';
      setError(error);
      throw new Error();
    }
    const {
      body,
      response,
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

    return JSON.parse(body).map(d => ({value: d.value, timestamp: calcTimeOffset('+2', d.timestamp)}));
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

    let svg = d3.select("#g-chart-d3")
      .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
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
      
    let zoom = d3.behavior.zoom().scaleExtent([0, 10000])
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

    let info = focus.append("g")
        .attr("class", "info")
        .style("display", "none");

    info.append("circle")
        .attr("r", 5);

    const defaultTipX = {
      tooltipRect: 10,
      tooltipDate: 18,
      tooltipText: 18,
      tooltipValue: 60,
    }

    const altTipX = {
      tooltipRect: -155,
      tooltipDate: -145,
      tooltipText: -145,
      tooltipValue: -100,
    }

    const tooltipRect = info.append("rect")
        .attr("class", "tooltip")
        .attr("width", 142)
        .attr("height", 50)
        .attr("x", defaultTipX.tooltipRect)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    const tooltipDate = info.append("text")
        .attr("class", "tooltip-date")
        .attr("x", defaultTipX.tooltipDate)
        .attr("y", -2);

    const tooltipText = info.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Value:");

    const tooltipValue = info.append("text")
        .attr("class", "tooltip-values")
        .attr("x", 60)
        .attr("y", 18);

    focus.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { info.style("display", null); })
        .on("mouseout", function() { info.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i],
          d1 = data[i],
          d = x0 - d0.date >= d1.date - x0 ? d1 : d0;
      if (i <= data.length / 2) {
        tooltipRect.attr('x', defaultTipX.tooltipRect)
        tooltipDate.attr('x', defaultTipX.tooltipDate)
        tooltipText.attr('x', defaultTipX.tooltipText)
        tooltipValue.attr('x', defaultTipX.tooltipValue)
      } else {
        tooltipRect.attr('x', altTipX.tooltipRect)
        tooltipDate.attr('x', altTipX.tooltipDate)
        tooltipText.attr('x', altTipX.tooltipText)
        tooltipValue.attr('x', altTipX.tooltipValue)
      }
      info.attr("transform", "translate(" + x(d.timestamp) + "," + y(d.value) + ")");
      info.select(".tooltip-date").text(dateFromTimestamp(d.timestamp));
      info.select(".tooltip-values").text(d.value);
    }

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
      let t = d3.event.translate;
      let s = d3.event.scale;
      let size = width*s;
      t[0] = Math.min(t[0], 0);
      t[0] = Math.max(t[0], width-size);
      zoom.translate(t);
      focus.select(".area").attr("d", area);
      focus.select(".x.axis").call(xAxis);
      // Find extent of zoomed area, what's currently at edges of graphed region
      let brushExtent = [x.invert(0), x.invert(width)];
      context.select(".brush").call(brush.extent(brushExtent));
    }

    function handleDateChange() {
      const from = new Date(fromInput.value).getTime();
      const to = new Date(toInput.value).getTime();
      brush.extent([from, to]);
      brush(d3.select('.brush').transition());
      brush.event(d3.select('.brush').transition().delay(1000));
    }

    function handleButtonClick() {
      fromInput.value = new Date(this.dataset.from).toDateInputValue();
      toInput.value = new Date().toDateInputValue();
      handleDateChange();
    }

    // set controls defaults
    const dates = data.map(function(d) { return d.timestamp } );
    const min = d3.min(dates);
    const max = d3.max(dates);

    fromInput.value = new Date(min).toDateInputValue();
    toInput.value = new Date().toDateInputValue();
    fromInput.min = new Date(min).toDateInputValue();
    fromInput.max = new Date(max).toDateInputValue();
    toInput.min = new Date(min).toDateInputValue();
    toInput.max = new Date().toDateInputValue();

    // wire up controls
    fromInput.addEventListener('change', handleDateChange);
    toInput.addEventListener('change', handleDateChange);
    const btns = Array.from(document.querySelectorAll('.btn-resolution'));
    btns.forEach(function(btn) {
      if (btn.dataset.resolution === 'Max') {
        btn.dataset.from = dateFromTimestamp(min);
      }
      btn.addEventListener('click', handleButtonClick);
    })
  };

  function renderStats() {
    const dates = data.map(d => dateFromTimestamp(d.timestamp));
    const values = data.map(d => d.value);
    const lastQuoteDate = dates[dates.length - 1];
    const lastQuoteValue = parseFloat(values[values.length - 1]);
    const prevQuoteValue = parseFloat(values[values.length - 2]);
    document.getElementById('last-quote-date').innerText = lastQuoteDate;
    document.getElementById('last-quote-value').innerText = lastQuoteValue;
    // dayChange = prev - current 
    const dayChange = `${(lastQuoteValue - prevQuoteValue).toFixed(2)}`;
    document.getElementById('day-change').innerText = dayChange;
    // Year range can show the highest and lowest closing prices since January 1.
    const d = new Date();
    const currentYear = d.getFullYear();
    const jan1Idx = dates.findIndex(d => d.split(' ')[3] == currentYear);
    const yearSlice = data.slice(jan1Idx).map(d => d.value);
    const min = d3.min(yearSlice)
    const max = d3.max(yearSlice)
    const rel = (dayChange / lastQuoteValue) * 100;
    document.getElementById('year-range').innerText = `High: ${max} | Low: ${min}`;
    document.getElementById('abs-rel').innerText = `$${dayChange}/${rel.toFixed(2)}`;
  }

  const init = () => {
    data = parseSolactiveData(solactive_data);

    if (data) {
      renderStats();
      drawChart();
    }
  };

  init();

})();