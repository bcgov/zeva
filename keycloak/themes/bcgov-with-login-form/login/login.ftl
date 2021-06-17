<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo displayWide=(realm.password && social.providers??); section>
  <#if section = "form">
    <div id="kc-form">
      <div id="kc-form-wrapper" <#if realm.password && social.providers??>class="has-social-accounts"</#if>>
        <#if realm.password>
          <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
            <div class="${properties.kcFormGroupClass!}">
              <#if usernameEditDisabled??>
                <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}" type="text" disabled placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>" />
              <#else>
                <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username" value="${(login.username!'')}"  type="text" autofocus autocomplete="off" placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>" />
              </#if>
            </div>

            <div class="${properties.kcFormGroupClass!}">
              <input tabindex="2" id="password" class="${properties.kcInputClass!}" name="password" type="password" autocomplete="off" placeholder="${msg("password")}" />
            </div>

            <div class="row">
              <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!} col-xs-6">
                <div id="kc-form-options">
                  <#if realm.rememberMe && !usernameEditDisabled??>
                    <div class="checkbox">
                      <label>
                        <#if login.rememberMe??>
                          <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                        <#else>
                          <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                        </#if>
                      </label>
                    </div>
                  </#if>
                  <div class="${properties.kcFormOptionsWrapperClass!}">
                    <#if realm.resetPasswordAllowed>
                      <span><a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a></span>
                    </#if>
                  </div>
                </div>
              </div>

              <div id="kc-form-buttons" class="${properties.kcFormGroupClass!} col-xs-6">
                <input tabindex="4" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
              </div>
            </div>
          </form>
        </#if>
      </div>

      <#if realm.password && social.providers??>
        <div id="kc-social-providers" class="${properties.kcFormSocialAccountContentClass!} ${properties.kcFormSocialAccountClass!}">
          <div class="${properties.kcFormSocialAccountListClass!} <#if social.providers?size gt 4>${properties.kcFormSocialAccountDoubleListClass!}</#if>">
            <#assign oidc_providers = [] />
            <#assign social_media_providers = [] />
            <#list social.providers as p>
              <#if p.providerId == "oidc">
                <#assign oidc_providers = oidc_providers + [p] />
              <#else>
                <#assign social_media_providers = social_media_providers + [p] />
              </#if>
            </#list>
            <#list oidc_providers as p>
              <div class="${p.providerId}">
                <a href="${p.loginUrl}" id="zocial-${p.alias}" class="${p.providerId}"> <span class="text">Login with</span> <span class="display-name">${p.displayName}</span></a>
              </div>
            </#list>
            <div class="social-links">
              <#if social_media_providers?size gt 0>
                <div class="social-links-header">Sign in with a social media account:</div>
              </#if>
              <#list social_media_providers as p>
                <div class="${properties.kcFormSocialAccountListLinkClass!}"><a href="${p.loginUrl}" id="zocial-${p.alias}" class="zocial ${p.providerId}"> <span>${p.displayName}</span></a></div>
              </#list>
            </div>
          </div>
        </div>
      </#if>
    </div>
  <#elseif section = "info">
    <#if realm.password && realm.registrationAllowed && !usernameEditDisabled??>
      <div id="kc-registration">
        <span>${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a></span>
      </div>
    </#if>
  </#if>

</@layout.registrationLayout>
