<?php
// shortcode
function g_charts_shortcode( $atts ) {
	$html = '
		<h2>Cannabis World Index</h2>
		<div id="g-charts-toolbar">
			<span class="indexID">Index ID: <strong>DE000SLA63U0</strong></span>
	';

	// foreach(['DAY', 'MONTH', 'YEAR'] as $resolution) {
	// 	$html .= "
	// 		<label for='$resolution'>
	// 			<input
	// 				id='$resolution'
	// 				value='$resolution'
	// 				name='resolution'
	// 				class='toggle-resolution'
	// 				type='checkbox' 
	// 			/> $resolution
	// 		</label>
	// 	";
	// }

	$html .= '
			<label for="from">From</label>
			<input id="from" name="from" type="date" />
			<label for="to">To</label>
			<input id="to" name="to" type="date" />
		</div><!-- /toolbar -->
		
		<p id="g-charts-error" style="color: red;"></p>

		<div class="chart-container" 
			style="position: relative; height:auto; width:100%">
			<canvas id="g-chart"></canvas>
		</div>
	';

	return $html;
}
add_shortcode( 'ganja-charts', 'g_charts_shortcode' );