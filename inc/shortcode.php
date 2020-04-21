<?php
// shortcode
function g_charts_shortcode( $atts ) {
	$resolutions = ['1 Week', '1 Month', '3 Months', '1 YEAR', '5 Years', 'Ytd', 'Max'];

	$html = '
		<h2>Cannabis World Index</h2>
		<div id="g-charts-toolbar">
	';

		foreach($resolutions as $resolution) {
			$html .= "<button class='btn-resolution' data-resolution='$resolution'>$resolution</button>";
		}

		$html .= '
			<label for="from">From</label>
			<input id="from" name="from" type="date" />
			<label for="to">To</label>
			<input id="to" name="to" type="date" />
		</div><!-- /toolbar -->
		
		<p id="g-charts-error" style="color: red;"></p>

		<div id="g-chart-d3"></div>

		<div id="g-chart-stats">
			<div>
				<h3>Master Data</h3>
				<table>
					<tr>
						<th>ISIN</th>
						<td>DE000SLA63U0</td>
					</tr>
					<tr>
						<th>Bloomberg Ticker</th>
						<td>CANWLDGR Index</td>
					</tr>
					<tr>
						<th>WKN</th>
						<td>SLA63U</td>
					</tr>
				</table>
			</div>
			<div>
				<h3>Current Quotes</h3>
				<table>
					<tr>
						<th>
							<small>Last quote</small><br/>
							<span id="last-quote-date"></span>
						</th>
						<td><span id="last-quote-value"></span></td>
					</tr>
					<tr>
						<th>Day change</th>
						<td><span id="day-change"></span></td>
					</tr>
					<tr>
						<th>Year range</th>
						<td><span id="year-range"></span></td>
					</tr>
				</table>
			</div>
		</div>

		<p><small>Please note that the index chart above may be partly comprised of historical performance illustration based on a backtest. The guideline provides an indication where this is the case.</small></p>
	';

	return $html;
}
add_shortcode( 'ganja-charts', 'g_charts_shortcode' );