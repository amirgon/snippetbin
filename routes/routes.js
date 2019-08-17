
const spawn = require('child_process').spawnSync;
const process = require('process');
const geoip = require('geoip-lite');

var appRouter = function (app) {

  const revision_pattern = new RegExp("^[0-9a-fA-F]+$");
  const cwd = process.env.PWD; // process.cwd();

  const spawn_options = {
    cwd: cwd + "/data",
    //cwd: "/tmp/test1",
    maxBuffer: 1024*1024,
    windowsHide: true
  };

  app.get("/test", function(req, res) {
    const pwd = spawn('pwd', [], spawn_options);
    res.status(200).send(`Welcome to our restful API\n pwd = ${pwd.stdout} cwd = ${cwd}\n` +
        `${JSON.stringify(req.headers)}`);
  });

  app.get("/load_file/:revision", function(req, res) {

    //Sanitize input

    if (!revision_pattern.test(req.params.revision)){
      res.status(400).send({"code": -1, "message": `Revision ${req.params.revision} is invalid`});
      return;
    }

    // Call git command

    const load_file = spawn(cwd + "/scripts/load_file.sh", ["-r", req.params.revision], spawn_options);

    // Register spawn events

    if (load_file.error){
      res.status(400).send({"code": 0, "message": load_file.error});
    }

    if (load_file.status == 0){
      // First line contains the history, the rest contain the text
      
      const stdout = load_file.stdout.toString().trim();
      const pos = stdout.indexOf("\n");
      const first_line = stdout.substring(0,pos);
      const text = stdout.substring(pos+1);
      const history = first_line.split(" ");
      res.status(200).send({"history": history, "text": text});
    } else {

      // Handle non zero return value from spawn
      
      res.status(400).send({"code": load_file.status, "message": load_file.stderr.toString()});
    }
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
      `Origin: ${req.headers["origin"]}\n` +
      `Referer: ${req.headers["referer"]}\n` +
      `Browser: ${req.headers["user-agent"]}\n` +
      `Language: ${req.headers["accept-language"]}\n`+
      `Country: ${(geo ? geo.country: "Unknown")}\n` + 
      `Region: ${(geo ? geo.region: "Unknown")}\n` +
      `City: ${(geo ? geo.city: "Unknown")}\n`;

    // Call git command
    
    const original_revision_arg = req.body.original_revision? ["-r", req.body.original_revision]: [];
    const save_file = spawn(cwd + "/scripts/save_file.sh", ["-c", commit_msg].concat(original_revision_arg), 
        Object.assign({"input":req.body.text}, spawn_options));

    if (save_file.error){
      res.status(400).send({"code": 0, "message": save_file.error.toString()});
    }

    if (save_file.status == 0){
      res.status(200).send({"revision" : save_file.stdout.toString().trim()});
    } else {

      // Handle non zero return value from spawn
      
      res.status(400).send({"code": save_file.status, "message": save_file.stderr.toString()});
    }

  });
}

module.exports = appRouter;
