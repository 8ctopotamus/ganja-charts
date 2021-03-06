<?php
// shortcode
function g_charts_shortcode( $atts ) {
	$resolutions = ['1 Week', '1 Month', '3 Months', '1 Year', '5 Years', 'Ytd', 'Max'];

	$html = '
		<h2>Cannabis World Index</h2>
		<div id="g-charts-toolbar">
	';

	$now = new DateTime('now');
	$currentYear = $now->format('Y');
	foreach($resolutions as $resolution) {
		if ($resolution == 'Max') {
			$fromDate=''; //NOTE: set in JS
		} else if ($resolution == 'Ytd') {
			$fromDate = $now->modify('first day of January ' . $currentYear);
			$fromDate = $fromDate->format('Y-m-d h:i:s');
		} else {
			$fromDate = $now->modify("-$resolution");
			$fromDate = $fromDate->format('Y-m-d h:i:s');
		}
		$html .= "<button class='btn-resolution' data-resolution='$resolution' data-from='$fromDate'>$resolution</button>";
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
						<th>Last quote</th>
						<td><span id="last-quote-date"></span>: <span id="last-quote-value"></span></td>
					</tr>
					<tr>
						<th>Day change</th>
						<td><span id="day-change"></span></td>
					</tr>
					<tr>
						<th>Year range</th>
						<td><span id="year-range"></span></td>
					</tr>
					<tr>
						<th>Abs./Rel.</th>
						<td><span id="abs-rel"></span>%</td>
					</tr>
				</table>
			</div>
		</div>

		<p><small>Please note that the index chart above may be partly comprised of historical performance illustration based on a backtest. The guideline provides an indication where this is the case.</small></p>
	';

	return $html;
}
add_shortcode( 'ganja-charts', 'g_charts_shortcode' );