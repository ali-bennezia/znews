#! /bin/sh

tryDelete()
{
	DEL_FILE="$1"
	if [ -f "$DEL_FILE" ]; then
			DEL_FLAGS="-f"
		elif [ -d "$DEL_FILE" ]; then
			DEL_FLAGS="-rf"
		else return
	fi
	rm $DEL_FLAGS "$DEL_FILE"
}

tryCopy()
{
	CP_BASENAME=`basename "$1"`
	CP_TARGETNAME="$3"
	CP_FROM="$1"
	CP_TO="$2"
	mkdir -p "$2"
	if [ -f "$CP_FROM" ]; then
			CP_FLAGS="-f"
		elif [ -d "$CP_FROM" ]; then
			CP_FLAGS="-rf"
		else return
	fi
	cp $CP_FLAGS "$CP_FROM" "${CP_TO}"
	if ! [ -z "$3" ]; then
		echo "${CP_TO}/${CP_BASENAME}" "${CP_TO}/${CP_TARGETNAME}"
		mv "${CP_TO}/${CP_BASENAME}" "${CP_TO}/${CP_TARGETNAME}"
	fi
}

overwrite()
{
	OW_FROM="$1"
	OW_TO="$2"
	tryDelete "$OW_TO"
	tryCopy "$OW_FROM" "$OW_TO"
}

echo "Building Znews..."

mkdir -p "./build"
tryDelete "./build/znews-build"

cd ./src/ui
ng build
cd ./../..

tryCopy "./src/backend" "./build" "znews-build"
tryCopy "./config" "./build/znews-build"
tryCopy "./src/ui/dist/ui" "./build/znews-build" "static"
tryCopy "./.env" "./build/znews-build"
