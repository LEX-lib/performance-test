import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { group, sleep, check } from 'k6';

export const errorRate = new Rate('error_rate');
const data = JSON.parse(open('./data.json'));

export let options = {
  vus: 100,
  duration: '45s',
  // stages: [
	// 	{ duration: '30s', target: 50 },
	// 	{ duration: '30s', target: 100 },
  //   { duration: '1m', target: 0 },
  // ],
  thresholds: {
    'http_req_duration': ['p(95)<1000','avg<150'],
    'error_rate': ['rate<0.01']
  },
};

export default function () {
  group("Frontpage", function() {
    const login_page = http.get('https://stackleague.com/login');
    sleep(1);

    check(login_page, {
			'Landing Page status is 200': (r) => r.status === 200,
		});


  });

  group("Login", function() {
  
    const login_API = http.post('https://stackleague.com/api/auth/login', JSON.stringify(data.credentials), {
      headers: { 'Content-Type': 'application/json' },
    });

		sleep(3);
	
    check(login_API, {
			'login api returns 200': (r) => r.status === 200
		});

		errorRate.add(!login_API);
  });

};
