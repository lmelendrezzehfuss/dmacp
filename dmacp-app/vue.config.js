module.exports = {
    publicPath: './',
    css: {
        loaderOptions: {
            sass: {
                prependData: `
                    @import "@/assets/scss/_main.scss";
                 `
            }
        }
    }
};
