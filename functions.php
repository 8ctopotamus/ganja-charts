<?php

function fetch_solactive_data( $resolution = 'DAY' ) {
  $response = wp_remote_get('https://clients.solactive.com/api/rest/v1/indices/'. SOLACTIVE_API_KEY .'/DE000SLA63U0/history?from=15201180000001&to=1583341780000&resolution='. $resolution);
  return $response;
}

