'use strict';
var fs = require('fs');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var writeSource = require('./writeSource');
var removePipelineExtras = require('./removePipelineExtras');

module.exports = writeGltf;

function writeGltf(gltf, outputPath, embed, embedImage, createDirectory, callback) {
    return new Promise(
        function(resolve, reject) {
            //Create the output directory if specified
            if (createDirectory) {
                outputPath = path.join(path.dirname(outputPath), 'output', path.basename(outputPath));
                mkdirp.sync(path.dirname(outputPath));
            }
            var basePath = path.dirname(outputPath);
            var writeBuffers = writeSource(gltf, basePath, 'buffers', embed, embedImage);
            var writeImages = writeSource(gltf, basePath, 'buffers', embed, embedImage);
            var writeShaders = writeSource(gltf, basePath, 'buffers', embed, embedImage);
            Promise.all([writeBuffers, writeImages, writeShaders]).then(function() {
                removePipelineExtras(gltf);
                fs.writeFile(outputPath, JSON.stringify(gltf, undefined, 2), function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }, function(err) {
                reject(err);
            });
        });
}
