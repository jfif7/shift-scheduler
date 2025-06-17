(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__e1992f7d._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/messages/en.json (json)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v(JSON.parse("{\"navigation\":{\"setup\":\"Setup\",\"constraints\":\"Constraints\"},\"schedule\":{\"title\":\"Schedule & Preferences\",\"generateButton\":\"Generate Schedule\",\"generating\":\"Generating...\",\"export\":\"Export\",\"exportCSV\":\"Export as CSV\",\"exportImage\":\"Export as Image\",\"settingPreferencesFor\":\"Setting preferences for:\",\"noActiveSchedule\":\"No active schedule selected. Please select a schedule from the schedule history above to view its generated schedule.\",\"monthSchedule\":\"{month} {year} Schedule\",\"clickToSetPreferences\":\"Click on days to set preferences:\",\"preferredDays\":\"Preferred days (✓)\",\"avoidDays\":\"Avoid days (✗)\",\"normalDays\":\"Normal days\"},\"days\":{\"sun\":\"Sun\",\"mon\":\"Mon\",\"tue\":\"Tue\",\"wed\":\"Wed\",\"thu\":\"Thu\",\"fri\":\"Fri\",\"sat\":\"Sat\"},\"months\":{\"january\":\"January\",\"february\":\"February\",\"march\":\"March\",\"april\":\"April\",\"may\":\"May\",\"june\":\"June\",\"july\":\"July\",\"august\":\"August\",\"september\":\"September\",\"october\":\"October\",\"november\":\"November\",\"december\":\"December\"},\"toast\":{\"noSchedule\":\"No schedule\",\"pleaseGenerateFirst\":\"Please generate a schedule first.\",\"csvExported\":\"CSV exported\",\"csvExportedDescription\":\"Schedule has been exported as CSV file.\",\"imageExported\":\"Image exported\",\"imageExportedDescription\":\"Schedule has been exported as PNG image.\",\"exportFailed\":\"Export failed\",\"csvExportFailedDescription\":\"Failed to export CSV file.\",\"imageExportFailedDescription\":\"Failed to export image file.\"}}"));}}),
"[project]/messages/zh-CN.json (json)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v(JSON.parse("{\"navigation\":{\"setup\":\"设置\",\"constraints\":\"约束条件\"},\"schedule\":{\"title\":\"班表与偏好设置\",\"generateButton\":\"生成班表\",\"generating\":\"生成中...\",\"export\":\"导出\",\"exportCSV\":\"导出为 CSV\",\"exportImage\":\"导出为图片\",\"settingPreferencesFor\":\"正在设置偏好的员工：\",\"noActiveSchedule\":\"未选择任何活动班表。请从上方的班表历史中选择一个班表来查看其生成的排班。\",\"monthSchedule\":\"{year}年{month}班表\",\"clickToSetPreferences\":\"点击日期来设置偏好：\",\"preferredDays\":\"偏好日期 (✓)\",\"avoidDays\":\"避免日期 (✗)\",\"normalDays\":\"普通日期\"},\"days\":{\"sun\":\"日\",\"mon\":\"一\",\"tue\":\"二\",\"wed\":\"三\",\"thu\":\"四\",\"fri\":\"五\",\"sat\":\"六\"},\"months\":{\"january\":\"1月\",\"february\":\"2月\",\"march\":\"3月\",\"april\":\"4月\",\"may\":\"5月\",\"june\":\"6月\",\"july\":\"7月\",\"august\":\"8月\",\"september\":\"9月\",\"october\":\"10月\",\"november\":\"11月\",\"december\":\"12月\"},\"toast\":{\"noSchedule\":\"无班表\",\"pleaseGenerateFirst\":\"请先生成班表。\",\"csvExported\":\"CSV 已导出\",\"csvExportedDescription\":\"班表已导出为 CSV 文件。\",\"imageExported\":\"图片已导出\",\"imageExportedDescription\":\"班表已导出为 PNG 图片。\",\"exportFailed\":\"导出失败\",\"csvExportFailedDescription\":\"CSV 文件导出失败。\",\"imageExportFailedDescription\":\"图片文件导出失败。\"}}"));}}),
"[project]/messages/zh-TW.json (json)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v(JSON.parse("{\"navigation\":{\"setup\":\"設定\",\"constraints\":\"約束條件\"},\"schedule\":{\"title\":\"班表與偏好設定\",\"generateButton\":\"生成班表\",\"generating\":\"生成中...\",\"export\":\"匯出\",\"exportCSV\":\"匯出為 CSV\",\"exportImage\":\"匯出為圖片\",\"settingPreferencesFor\":\"正在設定偏好的員工：\",\"noActiveSchedule\":\"未選擇任何活動班表。請從上方的班表歷史中選擇一個班表來查看其生成的排班。\",\"monthSchedule\":\"{year}年{month}班表\",\"clickToSetPreferences\":\"點擊日期來設定偏好：\",\"preferredDays\":\"偏好日期 (✓)\",\"avoidDays\":\"避免日期 (✗)\",\"normalDays\":\"普通日期\"},\"days\":{\"sun\":\"日\",\"mon\":\"一\",\"tue\":\"二\",\"wed\":\"三\",\"thu\":\"四\",\"fri\":\"五\",\"sat\":\"六\"},\"months\":{\"january\":\"1月\",\"february\":\"2月\",\"march\":\"3月\",\"april\":\"4月\",\"may\":\"5月\",\"june\":\"6月\",\"july\":\"7月\",\"august\":\"8月\",\"september\":\"9月\",\"october\":\"10月\",\"november\":\"11月\",\"december\":\"12月\"},\"toast\":{\"noSchedule\":\"無班表\",\"pleaseGenerateFirst\":\"請先生成班表。\",\"csvExported\":\"CSV 已匯出\",\"csvExportedDescription\":\"班表已匯出為 CSV 檔案。\",\"imageExported\":\"圖片已匯出\",\"imageExportedDescription\":\"班表已匯出為 PNG 圖片。\",\"exportFailed\":\"匯出失敗\",\"csvExportFailedDescription\":\"CSV 檔案匯出失敗。\",\"imageExportFailedDescription\":\"圖片檔案匯出失敗。\"}}"));}}),
"[project]/src/i18n/request.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/server/react-server/getRequestConfig.js [middleware-edge] (ecmascript) <export default as getRequestConfig>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/routing.ts [middleware-edge] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__["getRequestConfig"])(async ({ requestLocale })=>{
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;
    // Ensure that a valid locale is used
    if (!locale || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["routing"].locales.includes(locale)) {
        locale = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["routing"].defaultLocale;
    }
    return {
        locale,
        messages: (await __turbopack_context__.f({
            "../../messages/en.json": {
                id: ()=>"[project]/messages/en.json (json)",
                module: ()=>Promise.resolve().then(()=>__turbopack_context__.i("[project]/messages/en.json (json)"))
            },
            "../../messages/zh-CN.json": {
                id: ()=>"[project]/messages/zh-CN.json (json)",
                module: ()=>Promise.resolve().then(()=>__turbopack_context__.i("[project]/messages/zh-CN.json (json)"))
            },
            "../../messages/zh-TW.json": {
                id: ()=>"[project]/messages/zh-TW.json (json)",
                module: ()=>Promise.resolve().then(()=>__turbopack_context__.i("[project]/messages/zh-TW.json (json)"))
            }
        }).import(`../../messages/${locale}.json`)).default
    };
});
}}),
"[project]/src/i18n/routing.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Link": (()=>Link),
    "redirect": (()=>redirect),
    "routing": (()=>routing),
    "usePathname": (()=>usePathname),
    "useRouter": (()=>useRouter)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$routing$2f$defineRouting$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__defineRouting$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/routing/defineRouting.js [middleware-edge] (ecmascript) <export default as defineRouting>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$navigation$2f$react$2d$server$2f$createNavigation$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__createNavigation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/navigation/react-server/createNavigation.js [middleware-edge] (ecmascript) <export default as createNavigation>");
;
;
const routing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$routing$2f$defineRouting$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__defineRouting$3e$__["defineRouting"])({
    // A list of all locales that are supported
    locales: [
        "en",
        "zh-TW",
        "zh-CN"
    ],
    // Used when no locale matches
    defaultLocale: "en"
});
const { Link, redirect, usePathname, useRouter } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$navigation$2f$react$2d$server$2f$createNavigation$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__createNavigation$3e$__["createNavigation"])(routing);
}}),
"[project]/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/middleware/middleware.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/routing.ts [middleware-edge] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["routing"]);
const config = {
    // Match only internationalized pathnames
    matcher: [
        "/",
        "/(zh-TW|zh-CN|en)/:path*"
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__e1992f7d._.js.map