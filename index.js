var fs = require('fs'),
    path = require('path'),
    css = require('css'),
    cssIsolate = require('css-isolate');

function diff(basePath, file1, file2) {

    var content1 = fs.readFileSync(path.join(basePath, file1), 'utf-8'),
        content2 = fs.readFileSync(path.join(basePath, file2), 'utf-8'),
        diff1 = css.parse(cssIsolate.diff(content1, content2)),
        diff2 = css.parse(cssIsolate.diff(content2, content1));

    diff1.stylesheet.rules.forEach(function (rule) {
        rule.declarations.forEach(function (declaration) {
            declaration.value += ' /* ' + file1 + ' */';
        });
    });

    diff2.stylesheet.rules.forEach(function (rule) {
        rule.declarations.forEach(function (declaration) {
            declaration.value += ' /* ' + file2 + ' */';
        });
    });

    var addRules = [];

    diff2.stylesheet.rules.forEach(function (rule2) {
        var has = false;
        diff1.stylesheet.rules.forEach(function (rule1) {
            if (rule1.selectors.join(',') == rule2.selectors.join(',')) {
                has = true;
                rule1.declarations = rule1.declarations.concat(rule2.declarations);
            }
        });
        if (!has) {
            addRules.push(rule2);
        }
    });

    diff1.stylesheet.rules = diff1.stylesheet.rules.concat(addRules);

    if (diff1.stylesheet.rules.length) {
        return css.stringify(diff1);
    } else {
        return '/* No Difference */'
    }

}

exports.usage = 'CSS 文件 Diff';

exports.run = function(options) {
    var argv = process.argv,
        file1 = argv[3],
        file2 = argv[4];
    console.log('/* CSS Diff Result:*/');
    console.log(diff(options.cwd, file1, file2));
};