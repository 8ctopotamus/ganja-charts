<?php
// shortcode
function g_charts_shortcode( $atts ) {
	$html = '
		<h2>Cannabis World Index</h2>
		<div id="g-charts-toolbar">
			<label class="indexID" for="indexID">
				Index ID:
				<select id="indexID">
					<option value="DE000SLA63U0">DE000SLA63U0</option>
				</select>
			</label>
	';

	foreach(['DAY', 'MONTH', 'YEAR'] as $resolution) {
		$html .= "
			<label for='$resolution'>
				<input
					id='$resolution'
					value='$resolution'
					name='resolution'
					class='toggle-resolution'
					type='checkbox' 
				/> $resolution
			</label>
		";
	}

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