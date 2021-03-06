'use strict';
var Cesium = require('cesium');
var defaultValue = Cesium.defaultValue;

var byteLengthForComponentType = require('./byteLengthForComponentType');
var getAccessorByteStride = require('./getAccessorByteStride');
var numberOfComponentsForType = require('./numberOfComponentsForType');
var readBufferComponentType = require('./readBufferComponentType');
var writeBufferComponentType = require('./writeBufferComponentType');

module.exports = AccessorReader;

function AccessorReader(gltf, accessor) {
    var bufferViews = gltf.bufferViews;
    var buffers = gltf.buffers;
    var bufferViewId = accessor.bufferView;
    var bufferView = bufferViews[bufferViewId];
    var bufferId = bufferView.buffer;
    var buffer = buffers[bufferId];
    
    this.accessor = accessor;
    this.byteOffset = accessor.byteOffset + bufferView.byteOffset;
    this.byteStride = getAccessorByteStride(accessor);
    this.componentType = accessor.componentType;
    this.numberOfComponents = numberOfComponentsForType(accessor.type);
    this.count = accessor.count;
    this.index = 0;
    this.bufferView = bufferView;
    this.buffer = buffer;
    this.source = buffer.extras._pipeline.source;
}

AccessorReader.prototype.read = function(components) {
    if (this.index >= this.count) {
        return undefined;
    }
    var componentByteLength = byteLengthForComponentType(this.componentType);
    for (var i = 0; i < this.numberOfComponents; i++) {
        var data = readBufferComponentType(this.source, 
            this.componentType,
            this.byteOffset + (this.byteStride * this.index) + (componentByteLength * i)
        );
        if (i >= components.length) {
            components.push(data);
        } else {
            components[i] = data;
        }
    }
    return components;
};

AccessorReader.prototype.write = function(data, componentType, dataOffset) {
    componentType = defaultValue(componentType, this.componentType);
    dataOffset = defaultValue(dataOffset, 0);
    var componentByteLength = byteLengthForComponentType(componentType);
    var byteStride = this.byteStride;
    if (this.accessor.byteStride === 0 && componentType !== this.componentType) {
        byteStride = byteLengthForComponentType(componentType) * this.numberOfComponents;
    }
    for (var i = 0; i < this.numberOfComponents; i++) {
        writeBufferComponentType(this.source,
            componentType,
            data[i + dataOffset],
            this.byteOffset + (byteStride * this.index) + (componentByteLength * i)
        );
    }
};

AccessorReader.prototype.hasNext = function() {
    return this.index < this.count;
};

AccessorReader.prototype.next = function() {
    this.index++;
};

AccessorReader.prototype.reset = function() {
    this.index = 0;
};