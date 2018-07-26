const hapi = require('hapi');
const mongoose = require('mongoose');
const Painting = require('./models/Painting');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const schema = require('./graphql/schema');

mongoose.connect('mongodb://admin:passw0rd@ds145121.mlab.com:45121/powerfull-api', { useNewUrlParser: true });
mongoose.connection.once('open', () => {
    console.log('connected to database');
})

const server = new hapi.Server({
    port: 4000,
    host: 'localhost'
});

const init = async () => {
    await server.register({
        plugin: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql'
            },
            route: {
                cors: true
            }
        }
    });

    await server.register({
        plugin: graphqlHapi,
        options: {
            path: '/graphql',
            graphqlOptions: {
                schema
            },
            route: {
                cors: true
            }
        }
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: function (request, reply) {
                return `<h1>My modern api</h1>`;
            }
        },
        {
            method: 'GET',
            path: '/api/v1/paintings',
            handler: function (request, reply) {
                return Painting.find();
            }
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
            handler: function (request, reply) {
                const { name, url, techniques } = request.payload;
                const painting = new Painting({
                    name,
                    url,
                    techniques
                })
                return painting.save();
            }
        }
    ]);

    await server.start();
    console.log(`server run at : ${server.info.uri}`);
};

init();