<?php

function fetch_solactive_data(
  $from = '1520118000000',
  $to = '1583341780000'
) {
  
  echo '<pre>';
  var_dump($from);
  var_dump($to);
  echo '</pre>';

  $response = wp_remote_get("https://clients.solactive.com/api/rest/v1/indices/" . SOLACTIVE_API_KEY . "/DE000SLA63U0/history?from=$from&to=$to&resolution=DAY");

  $response['query'] = [
    'indexID' => 'DE000SLA63U0',
    'resolution' => 'DAY',
    'from' => $from,
    'to' => $to,
  ];
  return $response;
}