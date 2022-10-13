import * as React from "react";
import { FunctionComponent } from "react";
import codePush, { DownloadProgress } from "react-native-code-push";
import { observer } from "mobx-react-lite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AutoUpdateProgressScreen } from "../../screens/register/autoupdate";

export interface AutoUpdateProgress {
    status: codePush.SyncStatus | undefined
    setStatus: (status: codePush.SyncStatus) => void;

    progress: DownloadProgress | undefined
    setProgress: (progress: DownloadProgress) => void;

    showDownLoad: boolean
    setShowDownLoad: (show: boolean) => void;
}

const AutoUpdateProgressContext = React.createContext<AutoUpdateProgress | null>(null);

export const useAutoUpdateProgress = (): AutoUpdateProgress => {
    const progress = React.useContext(AutoUpdateProgressContext);
    if (!progress) {
        throw new Error("You have forgot to use AutoUpdateProgress provider");
    }
    return progress;
};

interface AutoUpdateProgressProp {
    autoUpdateProgress: AutoUpdateProgress
}

const showDownloadKey = "autoupdate.show.download"
const _loadShowSyncFlag = async (progress: AutoUpdateProgress | null = null) => {
    var showDownloadUpdate = (await AsyncStorage.getItem(showDownloadKey)) == true.toString()
    progress?.setShowDownLoad(showDownloadUpdate)
}

const _setShowFlag = (show: boolean) => {
    if (show) { 
        AsyncStorage.setItem(showDownloadKey, true.toString())
    } else {
        AsyncStorage.removeItem(showDownloadKey)
    }
    
}

const witnCodePushCustomBody = (OriginComponent: FunctionComponent) => {
    _loadShowSyncFlag() 
    return class CodePushCustomBody extends React.Component<AutoUpdateProgressProp> {

        constructor(props: any) {
            super(props)
            _loadShowSyncFlag(props.autoUpdateProgress)
        }

        codePushStatusDidChange(status: codePush.SyncStatus) {
            const autoUpdateProgress = this.props.autoUpdateProgress
            autoUpdateProgress.setStatus(status)
            switch (status) {
                case codePush.SyncStatus.UPDATE_INSTALLED:
                    if (autoUpdateProgress.showDownLoad) {
                        codePush.restartApp(true)
                    } else {
                        _setShowFlag(false)
                    }
                    break;
                case codePush.SyncStatus.UP_TO_DATE:
                    _setShowFlag(false)
                    autoUpdateProgress.setShowDownLoad(false)
                    break;
                case codePush.SyncStatus.DOWNLOADING_PACKAGE:
                    _setShowFlag(true)
                    break;
            
                default:
                    break;
            }
        }

        codePushDownloadDidProgress(progress: DownloadProgress) {
            const autoUpdateProgress = this.props.autoUpdateProgress
            autoUpdateProgress.setProgress(progress)
        }

        render() {
            return <OriginComponent {...this.props} />
        }
    }
}

const withAutoUpDateProgressContext = (OriginComponent: FunctionComponent) => {
    return observer(() => {
        const [status, setStatus] = React.useState<codePush.SyncStatus>();
        const [progress, setProgress] = React.useState<DownloadProgress>()
        const [showDownLoad, setShowDownLoad] = React.useState<boolean>(false)
        return (
            <AutoUpdateProgressContext.Provider
                value={{
                    status,
                    setStatus,
                    progress,
                    setProgress,
                    showDownLoad,
                    setShowDownLoad
                }}
            >
                <OriginComponent />
            </AutoUpdateProgressContext.Provider>
        )
    })
}

export const withAutoDownloadUI = (OriginBody: FunctionComponent) => () => {
    const autoUpdateProgress = useAutoUpdateProgress()
    return (autoUpdateProgress.showDownLoad == true ? <AutoUpdateProgressScreen/> : <OriginBody />)
}

export const autoUpdateBody = (OriginBody: any, useCodePush: any = false) => {
    if (!useCodePush) return withAutoUpDateProgressContext(OriginBody)
    const codePushOpts = { 
        checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
        installMode: codePush.InstallMode.ON_NEXT_RESUME,
        minimumBackgroundDuration: 600, // 600s = 10m
    }
    const BodyWithCodePush: FunctionComponent<AutoUpdateProgressProp> = 
        codePush(codePushOpts)(witnCodePushCustomBody(OriginBody))
  
    const AutoUpdateWrapper: FunctionComponent = () => {
      const autoUpdateProgress = useAutoUpdateProgress();
      return (
        <BodyWithCodePush autoUpdateProgress={autoUpdateProgress}/>
      )
    }
    return withAutoUpDateProgressContext(AutoUpdateWrapper)
  }
