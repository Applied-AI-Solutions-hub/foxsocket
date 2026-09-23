!include "${BUILD_RESOURCES_DIR}\maker-splash.nsh"
!include "${BUILD_RESOURCES_DIR}\readiness.nsh"
!include "${BUILD_RESOURCES_DIR}\install-identity.nsh"
!macro customInit
  !insertmacro AppliedAIMakerSplash
!macroend
