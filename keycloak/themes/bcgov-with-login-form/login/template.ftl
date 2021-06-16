<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayWide=false>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" class="${properties.kcHtmlClass!}">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="robots" content="noindex, nofollow" />

  <#if properties.meta?has_content>
    <#list properties.meta?split(' ') as meta>
      <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}" />
    </#list>
  </#if>
  <title>${msg("loginTitle",(realm.displayName!''))}</title>
  <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
  <#if properties.styles?has_content>
    <#list properties.styles?split(' ') as style>
      <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
    </#list>
  </#if>

  <#if properties.scripts?has_content>
    <#list properties.scripts?split(' ') as script>
      <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
    </#list>
  </#if>

  <#if scripts??>
    <#list scripts as script>
      <script src="${script}" type="text/javascript"></script>
    </#list>
  </#if>
</head>

<body class="${properties.kcBodyClass!}">
  <div id="kc-header" class="${properties.kcHeaderClass!}">
    <div id="kc-header-wrapper" class="${properties.kcHeaderWrapperClass!}">${kcSanitize(msg("loginTitleHtml",(realm.displayNameHtml!'')))?no_esc}</div>
  </div>
  <div class="${properties.kcLoginClass!}">
    <div id="kc-logo" class="${properties.kcLogoClass!}"></div>
      <div class="${properties.kcFormCardClass!} <#if displayWide>${properties.kcFormCardAccountClass!}</#if>">
        <div id="kc-content" class="${properties.kcContentClass!} <#if realm.loginWithEmailAllowed>has-login-form</#if>">
        <div id="kc-content-wrapper" class="${properties.kcContentWrapperClass!}">
          <#if displayMessage && message?has_content>
            <div class="alert alert-${message.type}">
              <#if message.type = 'success'><span class="${properties.kcFeedbackSuccessIcon!}"></span></#if>
              <#if message.type = 'warning'><span class="${properties.kcFeedbackWarningIcon!}"></span></#if>
              <#if message.type = 'error'><span class="${properties.kcFeedbackErrorIcon!}"></span></#if>
              <#if message.type = 'info'><span class="${properties.kcFeedbackInfoIcon!}"></span></#if>
              <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
            </div>
          </#if>

          <#nested "form">

          <#if displayInfo>
            <div id="kc-info" class="${properties.kcSignUpClass!}">
              <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                <#nested "info">
              </div>
            </div>
          </#if>
          <#if realm.name == "tfrs">
            <script>
            var userAgent = window.navigator.userAgent;
            var msie = userAgent.indexOf('MSIE ');
            var trident = userAgent.indexOf('Trident/');

            if (msie > 0 || trident > 0) {
              document.write('<div class="ie-specific">We have detected that you are running a browser that is not fully supported by <span class="realm-name">${realm.name}</span>. <br />We currently support Chrome, Firefox, Safari. <br />Please use one of our supported browsers to access <span class="realm-name">${realm.name}</span>.</div>');
            }
            </script>
          </#if>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
</#macro>
