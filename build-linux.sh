#! /bin/sh

deleteFileIfExists()
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

copyFileIfExists()
{
	CP_FROM="$1"
	CP_TO="$2"
	if [ -f "$CP_FROM" ]; then
			CP_FLAGS="-f"
		elif [ -d "$CP_FROM" ]; then
			CP_FLAGS="-rf"
		else return
	fi
	cp $CP_FLAGS "$CP_FROM" "$CP_TO"
}

overwriteFile()
{
	OW_FROM="$1"
	OW_TO="$2"
	deleteFileIfExists "$OW_TO"
	copyFileIfExists "$OW_FROM" "$OW_TO"
}

