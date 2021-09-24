// Author: Nuno Aguiar

/**
 * <odoc>
 * <key>nattrmon.nInput_Init(aMap)</key>
 * (tbc)
 * (Check config/inputs.disabled/00.init.yaml)
 * </odoc>
 */
 var nInput_Init = function(aMap) {
    if (getVersion() < "20210923") throw "nInput_Init is only supported starting on OpenAF version 20210923";

    if (isObject(aMap)) {
        this.params = aMap;
    } else {
        this.params = {};
    }
    
    this.params.AF  = _$(this.params.AF, "AF").isMap().default({});
    this.params.DB  = _$(this.params.DB, "DB").isMap().default({});
    this.params.SSH = _$(this.params.SSH, "SSH").isMap().default({});

    //if (isUnDef(this.params.attrTemplate)) this.params.attrTemplate = "Some default category/Some object";

    var setPool = (aPool, aEntry) => {
        if (isDef(aEntry.pool.max))           aPool.setMax(aEntry.pool.max);
        if (isDef(aEntry.pool.min))           aPool.setMin(aEntry.pool.min);
        if (isDef(aEntry.pool.retry))         aPool.setRetry(aEntry.pool.retry);
        if (isDef(aEntry.pool.retryInterval)) aPool.setTimeout(aEntry.pool.retryInterval);
        if (isDef(aEntry.pool.incrementsOf))  aPool.setIncrementsOf(aEntry.pool.incrementsOf);
        if (isDef(aEntry.pool.keepalive))     aPool.setKeepaliveInMs(aEntry.pool.keepalive);
    };

    var setAssociations = (aType, aEntry) => {
        if (isArray(aEntry.associations)) {
            aEntry.associations.forEach(aci => {
                _$(aci.parentKey , aType + " " + ichkey + " - " + aEntry.key + " parent key").isString().$_();
                _$(aci.type      , aType + " " + ichkey + " - " + aEntry.key + " type for " + aci.parentKey).isString().$_();

                nattrmon.associateObjectPool(aci.parentKey, aEntry.key, aci.type);
                log("Object pool " + aEntry.key + " associated with " + aci.parentKey + " as " + aci.type);
            })
        }
    };

    var setSec = aEntry => {
        if (isDef(aEntry.secKey)) {
            return merge(aEntry, $sec(aEntry.secRepo, aEntry.secBucket, aEntry.secPass, aEntry.secMainPass, aEntry.secFile).get(aEntry.secKey));
        } else {
            return aEntry;
        }
    }

    Object.keys(this.params.AF).forEach(ichkey => {
        var chkey = _$(this.params.AF[ichkey], ichkey).isArray().$_();
        try {
            chkey = _$(chkey, ichkey).isArray().default({});
    
            $ch(ichkey).create();
            chkey.forEach(entry => {
                try {
                    entry      = _$(entry, "AF " + ichkey + " entry").isMap().$_();
                    entry      = setSec(entry);
                    entry.pool = _$(entry.pool, "AF " + ichkey + " - " + entry.key + " pool").isMap().default({});
                    entry.key  = _$(entry.key, "AF " + ichkey + " entry key").isString().$_();

                    $ch(ichkey).set({ key: entry.key }, entry);
                    
                    log("Creating AF object pool to access " + entry.key + "...");
                    var p = ow.obj.pool.AF(entry.url, entry.timeout, entry.conTimeout, entry.dontUseTransaction);
                    setPool(p, entry);
                    nattrmon.addObjectPool(entry.key, p);

                    log("Created object pool to access " + entry.key);
                    setAssociations("AF", entry);
                } catch(e1) {
                    logErr(e1);
                }
            });
        } catch(e) {
            logErr(e);
        }
    });

    Object.keys(this.params.DB).forEach(ichkey => {
        var chkey = _$(this.params.DB[ichkey], ichkey).isArray().$_();
        try {
            chkey = _$(chkey, ichkey).isArray().default({});
    
            $ch(ichkey).create();
            chkey.forEach(entry => {
                try {
                    entry      = _$(entry, "DB " + ichkey + " entry").isMap().$_();
                    entry      = setSec(entry);
                    entry.pool = _$(entry.pool, "DB " + ichkey + " - " + entry.key + " pool").isMap().default({});
                    entry.key  = _$(entry.key, "DB " + ichkey + " entry key").isString().$_();

                    $ch(ichkey).set({ key: entry.key }, entry);
                    
                    log("Creating DB object pool to access " + entry.key + "...");
                    var p;
                    if (isDef(entry.driver)) {
                        p = ow.obj.pool.DB(entry.driver, entry.url, entry.login, entry.pass, __, entry.timeout);
                    } else {
                        p = ow.obj.pool.DB(entry.url, entry.login, entry.pass, __, entry.timeout);
                    }
                    setPool(p, entry);
                    nattrmon.addObjectPool(entry.key, p);

                    log("Created object pool to access " + entry.key);
                    setAssociations("DB", entry);
                } catch(e1) {
                    logErr(e1);
                }
            });
        } catch(e) {
            logErr(e);
        }
    });

    Object.keys(this.params.SSH).forEach(ichkey => {
        var chkey = _$(this.params.SSH[ichkey], ichkey).isArray().$_();
        try {
            chkey = _$(chkey, ichkey).isArray().default({});
    
            $ch(ichkey).create();
            chkey.forEach(entry => {
                try {
                    entry      = _$(entry, "SSH " + ichkey + " entry").isMap().$_();
                    entry      = setSec(entry);
                    entry.pool = _$(entry.pool, "SSH " + ichkey + " - " + entry.key + " pool").isMap().default({});
                    entry.key  = _$(entry.key, "SSH " + ichkey + " entry key").isString().$_();

                    $ch(ichkey).set({ key: entry.key }, entry);
                    
                    log("Creating SSH object pool to access " + entry.key + "...");
                    var p = ow.obj.pool.SSH(entry.host, entry.port, entry.login, entry.pass, entry.idkey, entry.withCompression);
                
                    setPool(p, entry);
                    nattrmon.addObjectPool(entry.key, p);

                    log("Created object pool to access " + entry.key);
                    setAssociations("SSH", entry);
                } catch(e1) {
                    logErr(e1);
                }
            });
        } catch(e) {
            logErr(e);
        }
    });

    nInput.call(this, this.input);
};
inherit(nInput_Init, nInput);

nInput_Init.prototype.input = function(scope, args) {
    var ret = {};

    return ret;
};