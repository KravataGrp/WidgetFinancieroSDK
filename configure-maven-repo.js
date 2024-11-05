const fs = require('fs');
const path = require('path');
const buildGradlePath = path.join(__dirname, './android/build.gradle');

const repoConfig1 = `    maven { url 'https://raw.githubusercontent.com/jitsi/jitsi-maven-repository/master/releases/' }`;

const repoConfig2 = `    maven {
        url = uri('https://maven.pkg.github.com/KravataGrp/WidgetFinancieroSDK')
        credentials {
            username = 'braiamkravata'
            password = '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'
        }
    }`;

fs.readFile(buildGradlePath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        let newData = data;
        const regex = /^(\s*)repositories\s*{([^}]*)}/gm;
        if (!data.includes(repoConfig1)){
            newData = newData.replace(regex, ($0, $1, $2) => `${$1}repositories {\n${$1}${repoConfig1}${$2}}`);
        }
        if (!data.includes(repoConfig2)){
            newData = newData.replace(regex, ($0, $1, $2) => `${$1}repositories {\n${$1}${repoConfig2}${$2}}`);
        }
        fs.writeFile(buildGradlePath, newData, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Repositorio de Maven configurado');
            }
        });
    }
});