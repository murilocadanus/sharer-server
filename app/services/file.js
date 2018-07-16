/**
 * @file Defines the file service.
 */
const fs = require('fs');
const xmlParser = require('xml2js');
const pathFiles = './repository/files';
const pathServerDictionary = './repository/server.xml';
var dictionary = [];

function generateDictionary() {
    console.info(`Generating a dictionary from path: ${pathFiles}`);
    var builder = new xmlParser.Builder();
    var dictionaryServerXML = { root: []};

    // Parse xmls from directory and create a dictionary
    fs.readdirSync(pathFiles).forEach(file => {
        var data = fs.readFileSync(`${pathFiles}/${file}`, 'utf8')
        xmlParser.parseString(data, function (err, result) {
            if (err) return console.log(err);
            if (!result) return;

            // Create our server dictionary element.
            var dictionaryServerElement = { 
                element: {
                    documentName: result.resource.documentName.toString(), 
                    version: result.resource.version.toString(), 
                    length: data.length,
                    pathTofile: `${pathFiles}/${file}`
                }
            }
            // Push to our xml array (server.xml)
            dictionaryServerXML.root.push(dictionaryServerElement);

            // Here we create an map with a hash NAME-VERSION,
            // this will be faster (O(1)) to find out files to download
            dictionary[`${dictionaryServerElement.element.documentName}-${dictionaryServerElement.element.version}`] = {
                documentName: dictionaryServerElement.element.documentName, 
                version: dictionaryServerElement.element.version, 
                length: dictionaryServerElement.element.length,
                pathTofile: dictionaryServerElement.element.pathTofile
            };
        });
    });

    // Create the server dictionary file (server.xml)
    fs.writeFile(pathServerDictionary, builder.buildObject(dictionaryServerXML), function(err) {
        if (err) console.info(err);
        else console.info(`Dictionary ${pathServerDictionary} generated.`);
    });
}

function getFileContent(path) {
    var data = fs.readFileSync(path, 'utf8');
    console.log(data);
    return data;
}

module.exports = {
    generateDictionary : generateDictionary,

    upload: (req, res) => {
        console.info(`Upload file...`);
        var builder = new xmlParser.Builder();
        var fileXML = { resource: []};

        // Create our server dictionary element.
        var fileElements = { 
            documentName: req.obj.documentName, 
            version: req.obj.version, 
            data: req.obj.data
        }
        fileXML.resource.push(fileElements);

        // generate a random file name
        var filename = `${req.obj.documentName}-${req.obj.version}`;

        // Write new file into file system.
        fs.writeFile(`./repository/files/${filename}`, builder.buildObject(fileXML), function(err) {
            if (err) console.info(err);
            else {
                console.info(`File ${filename} generated.`);
                generateDictionary();
            }
        });

        res.send({
            data: { msg: "upload OK"}
        });
    },

    download: (req, res) => {
        console.info(`Download file ${req.obj.pathToFile}`);
        var path = req.obj.pathToFile;

        if (path) {
            var fileContent = getFileContent(path);
            res.send({
                data: { fileContent: fileContent}
            });
        } else {
            var errMsg = `Document name: ${req.obj.documentName} version: ${req.obj.version} not found!`;
            res.send({
                data: { msg: errMsg }
            });
        }
    },

    downloadDictionary: (req, res) => {
        console.info(`Download dictionary...`);
        var fileContent = getFileContent('./repository/server.xml');
        res.send({
            data: { fileContent: fileContent}
        });
    }
};