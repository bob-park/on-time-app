import ky from 'ky';

const index = ky.extend({
  hooks: {
    afterResponse: [(request, options, response) => {}],
  },
});

export default index;
