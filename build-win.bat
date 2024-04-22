@ECHO OFF
SETLOCAL
echo "Building Znews..."

CALL :TryDelete ".\build\znews-build"

cd .\src\ui
start /wait /min cmd /c "ng build"
cd .\..\..
CALL :TryMkDir ".\build"
CALL :Overwrite ".\src\backend" ".\build\znews-build"

CALL :TryMkDir ".\build\znews-build\config"
CALL :Overwrite ".\config\config.json" ".\build\znews-build\config\config.json"
CALL :Overwrite ".\config\backend-config.json" ".\build\znews-build\config\backend-config.json"

CALL :TryDelete ".\build\znews-build\static"
CALL :Overwrite ".\src\ui\dist\ui" ".\build\znews-build\static"
CALL :Overwrite ".\.env" ".\build\znews-build\.env"

:TryMkDir
if not exist "%~1" (
	mkdir "%~1"
)
EXIT /B 0
:TryDelete
	if exist "%~1\*" (
		RMDIR /Q /S "%~1"
	) else (
		if exist "%~1" (
			DEL /Q "%~1"
		)
	)
EXIT /B 0
:Overwrite
	CALL :TryDelete "%~2"
	if exist "%~1\*" (
		xcopy /e /i /y /h "%~1" "%~2"	
	) else (
		if exist "%~1" (
			copy /y "%~1" "%~2"
		)
	)
EXIT /B 0
