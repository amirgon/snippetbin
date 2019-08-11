
const { spawn } = require('child_process');

var appRouter = function (app) {

  app.get("/", function(req, res) {
    const pwd = spawn('pwd');
    pwd.stdout.on('data', (data)=> {
        res.status(200).send(`Welcome to our restful API\n pwd = ${data}`);
    });
  });

  app.get("/load_file/:revision_key", function(req, res) {
    const load_file = spawn("../scripts/load_file.sh", 
      

  });



}

module.exports = appRouter;
