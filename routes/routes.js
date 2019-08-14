
const { spawn } = require('child_process');
const process = require('process');
const geoip = require('geoip-lite');

var appRouter = function (app) {

  const revision_pattern = new RegExp("^[0-9a-fA-F]+$");
  const cwd = process.cwd();

  const spawn_options = {
    //cwd: cwd + "/data",
    cwd: "/tmp/test",
    maxBuffer: 1024*1024,
    windowsHide: true
  };

  app.get("/test", function(req, res) {
    const pwd = spawn('pwd', [], spawn_options);
    pwd.stdout.on('data', (data)=> {
      res.status(200).send(`Welcome to our restful API\n pwd = ${data} cwd = ${cwd}\n` +
          `${JSON.stringify(req.headers)}`);
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
      res.status(400).send({"code": -1, "message": `Original revision ${req.body.original_revision} is invalid`});
      return;
    }

    // Create commit message from HTTP headers
    
    const geo = geoip.lookup(req.ip);

    const commit_msg = 
      `IP: ${JSON.stringify(req.ip)}\n`+
      `Referer: ${req.headers["referer"]}\n` +
      `Browser: ${req.headers["user-agent"]}\n` +
      `Language: ${req.headers["accept-language"]}\n`+
      `Country: ${(geo ? geo.country: "Unknown")}\n` + 
      `Region: ${(geo ? geo.region: "Unknown")}\n` +
      `City: ${(geo ? geo.region: "Unknown")}\n`;

    // Call git command
    
    const original_revision_arg = req.body.original_revision? ["-r", req.body.original_revision]: [];
    const save_file = spawn(cwd + "/scripts/save_file.sh", ["-c", commit_msg].concat(original_revision_arg), spawn_options);
    let save_file_result = {};

    save_file.on('error', (err) => res.status(400).send({"code": 0, "message": err.toString()}));
    save_file.stdout.on('data', (data) => save_file_result.stdout = data.toString());
    save_file.stderr.on('data', (data) => save_file_result.stderr = data.toString());
    save_file.on('exit', (code, signal) => {
      if (code == 0){
        res.status(200).send({"revision" : save_file_result.stdout});
      } else {

        // Handle non zero return value from spawn
        
        res.status(400).send({"code": code, "message": load_file_result.stderr});
      }
    });
  });
}

module.exports = appRouter;
