<?php

// routes
add_action( 'admin_post_nopriv_g_charts_actions', 'g_charts_actions' );
add_action( 'admin_post_g_charts_actions', 'g_charts_actions' );
function g_charts_actions() {
	if (empty($_GET['from']) || empty($_GET['to'])) {
		echo 'Error: Date range not provided';
		die();
	}
	$data = fetch_solactive_data($_GET['from'], $_GET['to']);
	echo json_encode($data);
	die();
}

// enqueue scripts + styles
add_action( 'wp_enqueue_scripts', 'g_charts_load_shortcode_resources' );
function g_charts_load_shortcode_resources() {
	global $post, $wpdb;
	
	wp_register_style( 'g_charts_style', plugin_dir_url( __DIR__ ) . 'css/style.css' );
	wp_register_script( 'chartjs', '//cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js', '', false, true );
	wp_register_script( 'g_charts', plugin_dir_url( __DIR__ ) . 'js/g-charts.js', array('jquery'), false, true );

	// check if shorcode is used
	$shortcode_found = false;
	if (has_shortcode($post->post_content, 'ganja-charts') ) {
		 $shortcode_found = true;
	} else if ( isset($post->ID) ) { // checks post meta
		 $result = $wpdb->get_var( $wpdb->prepare(
			 "SELECT count(*) FROM $wpdb->postmeta " .
			 "WHERE post_id = %d and meta_value LIKE '%%ganja-charts%%'", $post->ID ) );
		 $shortcode_found = ! empty( $result );
	}
	
	if ( $shortcode_found ) {
		wp_enqueue_style( 'g_charts_style' );
		wp_enqueue_script( 'chartjs' );
		$defaultFrom = new DateTime('first day of January this year');
		$defaultTo = new DateTime('first day of January next year');
		$fromTimestamp = $defaultFrom->getTimestamp() * 1000;
		$toTimestamp = $defaultTo->getTimestamp() * 1000;
		$translation_array = array(
			'solactive_data' => fetch_solactive_data($fromTimestamp, $toTimestamp),
			'ajax_url' => esc_url( admin_url('admin-post.php') ),
			'site_url' => site_url(),
			'plugin_slug' => PLUGIN_SLUG,
		);
		wp_localize_script( 'g_charts', 'wp_data', $translation_array );
		wp_enqueue_script( 'g_charts' );
	}
}
