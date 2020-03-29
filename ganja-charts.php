<?php
/*
  Plugin Name: Ganja Charts
  Plugin URI:  https://github.com/8ctopotamus/ganja-charts
  Description: Solactive API DataViz.
  Version:     1.0
  Author:      @8ctopotamus
  Author URI:  https://github.com/8ctopotamus
  License:     GPL2
  License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

include('keys.php');
include('functions.php');

// enqueue scripts + styles
function g_charts_load_shortcode_resources() {
	global $post, $wpdb;
	
	wp_register_script( 'chartjs', '//cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js', '', false, true );
	wp_register_script( 'g-charts', plugin_dir_url( __FILE__ ) . '/js/g-charts.js', array('jquery'), false, true );

	$shortcode_found = false;
	
	// check if shorcode is used
	if (has_shortcode($post->post_content, 'ganja-charts') ) {
		 $shortcode_found = true;
	} else if ( isset($post->ID) ) { // checks post meta
		 $result = $wpdb->get_var( $wpdb->prepare(
			 "SELECT count(*) FROM $wpdb->postmeta " .
			 "WHERE post_id = %d and meta_value LIKE '%%ganja-charts%%'", $post->ID ) );
		 $shortcode_found = ! empty( $result );
	}
	
	if ( $shortcode_found ) {
		wp_enqueue_script( 'chartjs' );
		$translation_array = array( 'solactive_data' => fetch_solactive_data() );
		wp_localize_script( 'g-charts', 'wp_data', $translation_array );
		wp_enqueue_script( 'g-charts' );
	}
}
add_action( 'wp_enqueue_scripts', 'g_charts_load_shortcode_resources' );


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