<?php
// shortcode
function g_charts_shortcode( $atts ) {
	$html = '
		<h2>Cannabis World Index</h2>
		<p id="g-charts-error" style="color: red;"></p>
		<div class="chart-container" style="position: relative; height:auto; width:100%"><!-- height:40vh; width:80vw -->
			<canvas id="g-chart"></canvas>
			<ul>
				<li>Index ID: <span id="indexID"></span></li>
			</ul>
		</div>
	';
	return $html;
}
add_shortcode( 'ganja-charts', 'g_charts_shortcode' );