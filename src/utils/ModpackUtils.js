const fs = require('fs');
const shell = require('electron').remote.shell;
const StorageUtils = require('./../utils/StorageUtils');
const instancesFolder = require('electron').remote.app.getPath('userData') + '/instances/';
const maxLength = 182;

function parseInstances() {
    let instances = [];

    StorageUtils.getOrDefault('instances', []).forEach(instanceID => {
        let instanceConfig = instancesFolder + instanceID + '/pack.json';
        if(fs.existsSync(instanceConfig)) {
            let instance = JSON.parse(fs.readFileSync(instanceConfig));
            instances.push(instanceToObj(instance));
        }
    });

    return instances;
}

function toggleMod(instanceID, modname) {
    let instanceFolder = instancesFolder + instanceID;
    let modsFolder = instanceFolder + '/mods/';
    let instance = JSON.parse(fs.readFileSync(instanceFolder + '/pack.json'));
    let fileName = instance.mods[modname].file;

    if(fs.existsSync(modsFolder + fileName)) {
        let enabled = instance.mods[modname].enabled;
        let newFile = (enabled ? fileName + '.disabled' : fileName.replace('.disabled', ''));

        instance.mods[modname].file = newFile;
        instance.mods[modname].enabled = !enabled;
        fs.writeFile(instanceFolder + '/pack.json', JSON.stringify(instance, null, 2), function (err) {
            if (err) console.log(err);
        });

        fs.rename(modsFolder + fileName, modsFolder + newFile, function (err) {
            if (err) console.log(err);
        });
    }

    return instanceToObj(instance);
}

function instanceToObj(instance) {
    let mods = [];
    let localLogoPath = instancesFolder + instance.id + '/' + instance.logo;
    let logo = fs.existsSync(localLogoPath) ? localLogoPath : instance.logo;
    for (let key in instance.mods) {
        let mod = instance.mods[key];

        mods.push({
            name: key,
            curseID: mod.curseID,
            author: mod.author,
            file: mod.file,
            enabled: mod.enabled
        });
    }

    return({
        id: instance.id,
        name: instance.name,
        logo: logo,
        version: instance.version,
        author: instance.author,
        description: instance.description ? instance.description.substr(0, maxLength) : '',
        mods: mods
    });
}

function openInstanceFolder(instanceID) {
    shell.openItem(instancesFolder + instanceID);
}

module.exports = {
    parseInstances,
    toggleMod,
    openInstanceFolder
};