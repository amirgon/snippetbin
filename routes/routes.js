
const { spawn } = require('child_process');
const process = require('process');

var appRouter = function (app) {

  const revision_pattern = new RegExp("^[0-9a-fA-F]+$");
  const cwd = process.cwd();

  const spawn_options = {
    cwd: cwd + "/data",
    maxBuffer: 1024*1024,
    windowsHide: true
  };

  app.get("/", function(req, res) {
    const pwd = spawn('pwd', [], spawn_options);
    pwd.stdout.on('data', (data)=> {
      res.status(200).send(`Welcome to our restful API\n pwd = ${data} cwd = ${cwd}`);
    });
  });

  app.get("/load_file/:revision", function(req, res) {

    //Sanitize input

    if (!revision_pattern.test(req.params.revision)){
      res.status(400).send({"code": -1, "message": `Revision ${req.params.revision} is invalid`});
      return;
    }

    // Call git command

    const load_file = spawn(cwd + "/scripts/load_file.sh", ["-r", req.params.revision], spawn_options);
    let load_file_result = {};

    // Register spawn events

    load_file.on('error', (err) => res.status(400).send({"code": 0, "message": err.toString()}));
    load_file.stdout.on('data', (data) => load_file_result.stdout = data.toString());
    load_file.stderr.on('data', (data) => load_file_result.stderr = data.toString());
    load_file.on('exit', (code, signal) => {
      if (code == 0){

        // First line contains the history, the rest contain the text
        
        const pos = load_file_result.stdout.indexOf("\n");
        const first_line = load_file_result.stdout.substring(0,pos);
        const text = load_file_result.stdout.substring(pos+1);
        const history = first_line.split(" ");
        res.status(200).send({"history": history, "text": text});
      } else {

        // Handle non zero return value from spawn
        
        res.status(400).send({"code": code, "message": load_file_result.stderr});
      }
    });
  });

  app.post("/save_file/", function(req, res) {
    
    //Sanitize input

    if (req.body.original_revision && !revision_pattern.test(req.body.original_revision)){
      res.status(400).send({"code": -1, "message": `Revision ${req.body.original_revision} is invalid`});
      return;
    }

    // Call git command
    
    const original_revision_arg = req.body.original_revision? ["-r", req.body.original_revision]: [];
    const commit_msg = ``;

    const save_file = spawn(cwd + "/scripts/save_file.sh", ["-c", commit_msg], spawn_options);
    let load_file_result = {};

  });

}

module.exports = appRouter;
