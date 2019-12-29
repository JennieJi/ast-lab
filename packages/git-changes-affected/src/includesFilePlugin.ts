class IncludesFilePlugin {
  files: Set<string>;
  extensions: string[];

	constructor(files: string[],  extensions?: string[]) {
    this.files = new Set(files);
    this.extensions = extensions || ['.jsx', '.js', '.ts', '.tsx'];
	}

	apply(resolver: any) {
    const target = resolver.ensureHook('resolved');
		resolver
			.getHook('directory')
			.tapAsync("IncludesFilePlugin", (request: any, resolveContext: any, callback: any) => {
        const filename = request.path;
        const tryResolveFile = (file: string) => {
          if (this.files.has(file)) {
            if (resolveContext.fileDependencies)
              resolveContext.fileDependencies.add(file);
            resolver.doResolve(
              target,
              {
                ...request,
                path: file
              },
              "existing file: " + file,
              resolveContext,
              callback
            );
            return true;
          }
        };
        const fileExt = this.extensions.find(ext => {
          return tryResolveFile(`${filename}${ext}`) || 
            tryResolveFile(`${filename}/index${ext}`);
        });
        if (!fileExt) {
          if (resolveContext.missingDependencies) {
            resolveContext.missingDependencies.add(filename);
          }
          if (resolveContext.log) {
            resolveContext.log(filename + " doesn't exist");
          }
          return callback();
        }
			});
	}
};

export default IncludesFilePlugin;