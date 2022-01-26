import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { group, sleep, check } from 'k6';

export const errorRate = new Rate('error_rate');

export let options = {
  vus: 130,
  duration: '30s',
  // stages: [
	// 	{ duration: '1m', target: 100 },
	// 	{ duration: '6m', target: 300 },
  //   { duration: '1m', target: 0 },
  // ],
  thresholds: {
    'http_req_duration': ['p(95)<1000','avg<150'],
    'error_rate': ['rate<0.01']
  },
};

export default function () {
  group("Landing Page", function() {
    const responses = http.batch([
      ['GET', 'https://staging.stackleague.com/'],
      ['GET', 'https://staging.stackleague.com/ranking'],
    ]);

		sleep(1);
	
		check(responses[0], {
			'Landing Page status is 200': (r) => r.status === 200,
		});

    check(responses[1], {
			'Ranking Page status is 200': (r) => r.status === 200,
		});

		errorRate.add(!responses);

  });

};
