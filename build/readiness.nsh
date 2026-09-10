!ifndef BUILD_UNINSTALLER
!include "nsDialogs.nsh"
!include "LogicLib.nsh"
Var SetupRole
Var HostChoice
Var ClientChoice
Var ReadinessText
Var ReadinessReport

!macro ReadinessLine key
  ReadINIStr $1 "$PLUGINSDIR\readiness.ini" "Readiness" "${key}"
  StrCpy $ReadinessReport "$ReadinessReport${key}: $1$\r$\n"
!macroend

!macro ReadinessFunctions
Function ChooseRolePage
  !insertmacro MUI_HEADER_TEXT "How will you use this computer?" "Choose a role before installing. You can change this during setup."
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 26u "Host runs your agent here. Client connects to an agent on another computer."
  Pop $0
  ${NSD_CreateRadioButton} 0 38u 100% 18u "Host - run my agent on this computer"
  Pop $HostChoice
  ${NSD_CreateRadioButton} 0 72u 100% 18u "Client - connect to an existing Host"
  Pop $ClientChoice
  ${If} $SetupRole == "host"
    ${NSD_Check} $HostChoice
  ${ElseIf} $SetupRole == "client"
    ${NSD_Check} $ClientChoice
  ${EndIf}
  ${NSD_CreateLabel} 0 112u 100% 36u "Next checks this PC and explains what is available. OpenClaw, Linux, Tailscale, and AI models are not installed by this check."
  Pop $0
  nsDialogs::Show
FunctionEnd

Function ChooseRoleLeave
  ${NSD_GetState} $HostChoice $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $SetupRole "host"
  ${Else}
    ${NSD_GetState} $ClientChoice $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $SetupRole "client"
    ${Else}
      MessageBox MB_OK "Choose Host or Client to continue."
      Abort
    ${EndIf}
  ${EndIf}
FunctionEnd

Function ReadinessPage
  !insertmacro MUI_HEADER_TEXT "Review this computer" "Read-only checks before installation. No account credentials are inspected."
  InitPluginsDir
  File /oname=$PLUGINSDIR\readiness.ps1 "${BUILD_RESOURCES_DIR}\readiness.ps1"
  nsExec::ExecToStack /TIMEOUT=20000 '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\readiness.ps1" -OutFile "$PLUGINSDIR\readiness.ini"'
  Pop $0
  Pop $1
  StrCpy $ReadinessReport "Some checks could not finish. You can continue with app installation and use guided setup to investigate. No Host connection has been verified."
  ${If} $0 == "0"
    StrCpy $ReadinessReport ""
    !insertmacro ReadinessLine "Computer"
    !insertmacro ReadinessLine "Windows"
    !insertmacro ReadinessLine "Architecture"
    !insertmacro ReadinessLine "Processor"
    !insertmacro ReadinessLine "Memory"
    !insertmacro ReadinessLine "Storage"
    !insertmacro ReadinessLine "Graphics"
    !insertmacro ReadinessLine "Restart"
    !insertmacro ReadinessLine "Node"
    !insertmacro ReadinessLine "Virtualization"
    !insertmacro ReadinessLine "Linux"
    !insertmacro ReadinessLine "OpenClaw"
    !insertmacro ReadinessLine "Tailscale"
    !insertmacro ReadinessLine "Model"
  ${EndIf}
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${If} $SetupRole == "host"
    ${NSD_CreateLabel} 0 0 100% 32u "Host: we will guide runtime setup, provider choice, permissions, and a real reply. RAM alone does not prove a local AI model will run well."
  ${Else}
    ${NSD_CreateLabel} 0 0 100% 32u "Client: OpenClaw and Linux are not required here. You will need private connectivity and approval from your Host."
  ${EndIf}
  Pop $0
  nsDialogs::CreateControl EDIT ${WS_VISIBLE}|${WS_CHILD}|${WS_TABSTOP}|${WS_VSCROLL}|${ES_MULTILINE}|${ES_READONLY}|${ES_AUTOVSCROLL} ${WS_EX_CLIENTEDGE} 0 38u 100% 92u "$ReadinessReport"
  Pop $ReadinessText
  ${NSD_CreateLabel} 0 136u 100% 30u "Back changes the role. Cancel leaves the app uninstalled. Continue installs the app only; prerequisite setup follows separately."
  Pop $0
  nsDialogs::Show
FunctionEnd

!macroend

!macro customWelcomePage
  !insertmacro ReadinessFunctions
  Page custom ChooseRolePage ChooseRoleLeave
  Page custom ReadinessPage
!macroend

!macro customInstall
  ${If} $SetupRole == "host"
  ${OrIf} $SetupRole == "client"
    FileOpen $0 "$INSTDIR\resources\installer-role.json" w
    FileWrite $0 '{"role":"$SetupRole"}'
    FileClose $0
  ${EndIf}
!macroend
!endif
