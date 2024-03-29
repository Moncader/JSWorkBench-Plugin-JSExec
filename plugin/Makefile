# Variable default definitions. Override them by exporting them in your shell.

EXEC ?= jsexec

CXX ?= g++
CC ?= g++
LINK ?= g++
CFLAGS ?= -pipe -O3

ARCH ?= $(shell uname -m)
ARCH := $(shell echo $(ARCH))
OS ?= $(shell uname -s);
OS := $(shell echo $(OS))

OUT ?= bin
BUILD_DIR ?= build
NATIVE_BUILD_DIR := $(BUILD_DIR)/native
JS_BUILD_DIR := $(BUILD_DIR)/js
SRC_DIR := src
JS_SRC_DIR := $(SRC_DIR)/js
NATIVE_SRC_DIR := $(SRC_DIR)/native
VENDOR_DIR := vendor

ifeq ($(OS),Darwin)
  	TARGET ?= x64.release
	CFLAGS := $(CFLAGS) -m64
	V8DIR_OUT := $(VENDOR_DIR)/v8/out/$(TARGET)/
endif

ifeq ($(OS),Linux)
  	ifeq ($(ARCH),x86_64)
		CFLAGS := $(CFLAGS) -m64
  		TARGET ?= x64.release
	else
		CFLAGS := $(CFLAGS) -m32
  		TARGET ?= ia32.release
	endif
	V8DIR_OUT := $(VENDOR_DIR)/v8/out/$(TARGET)/obj.target/tools/gyp/
endif

NATIVE_FILES ?= $(shell find $(NATIVE_SRC_DIR) -type f -name '*.cc')
JS_FILES ?= $(shell find $(JS_SRC_DIR) -type f -name '*.js' | sort)
NATIVE_BUILD_FILES ?= $(addprefix $(NATIVE_BUILD_DIR)/,$(NATIVE_FILES:.cc=.o))
JS_BUILD_FILES ?= $(addprefix $(JS_BUILD_DIR)/,$(JS_FILES:.js=.c))

NATIVE_DEPS ?= $(shell find $(NATIVE_SRC_DIR) -type f -name '*.h')

noop=
space=$(noop) $(noop)
comma=,

TEMP_JS_FILES := char sJavaScriptFiles[] = { $(subst $(space),$(comma),$(subst .,_,$(subst /,_,$(subst -,_,$(JS_FILES))))) };
TEMP_JS_FILE_LENS := const int sJavaScriptFileLengths[] = { $(subst $(space),$(comma),$(subst .js,_js_len,$(subst /,_,$(subst -,_,$(JS_FILES))))) };
TEMP_JS_FILE_COUNT := const int sJavaScriptFilesCount = $(shell echo "$(JS_FILES)" | wc -w);

.PHONY: all print clean v8 _jsexec jsexec $(NATIVE_BUILD_DIR) $(JS_BUILD_DIR)

print:
	@echo $(JS_FILES)
	@echo $(JS_BUILD_FILES)
	@echo $(TEMP_JS_FILES)
	@echo $(OS)
	@echo $(ARCH)
	@echo $(CFLAGS)
	@echo $(TARGET)
	@echo $(TEST)

all: v8 jsexec

jsexec: directories _jsexec

$(NATIVE_BUILD_FILES): $(NATIVE_BUILD_DIR)/%.o: %.cc $(NATIVE_DEPS)
	mkdir -p $$(dirname $@)
	$(CXX) $(CFLAGS) -c -I$(BUILD_DIR) -Ivendor/v8/include -o $@ $<

$(JS_BUILD_FILES): $(JS_BUILD_DIR)/%.c: %.js
	mkdir -p $$(dirname $@)
	xxd -i $< | tr -d '\n{}' | sed 's/^unsigned char \([a-zA-Z0-9_]*\)\[\] =/#define \1/' | tr ';' '\n' | sed 's/unsigned int \([a-zA-Z0-9_]*\) =/#define \1/' > $@

_jsexec: $(BUILD_DIR)/javascript_files.o $(NATIVE_BUILD_FILES) 
	$(LINK) $(CFLAGS) $^ -pthread -fno-rtti -fno-exceptions -fvisibility=hidden -fdata-sections -ffunction-sections -fomit-frame-pointer -O3 -L$(V8DIR_OUT) -lv8_base -lv8_snapshot -o $(OUT)/$(EXEC)

$(BUILD_DIR)/javascript_files.c: $(JS_BUILD_FILES)
	echo "$(TEMP_JS_FILES)" > $@;
	echo "$(TEMP_JS_FILE_LENS)" >> $@
	echo "$(TEMP_JS_FILE_COUNT)" >> $@

$(BUILD_DIR)/javascript_files.o: $(BUILD_DIR)/javascript_files.c
	cat $(JS_BUILD_FILES) $^ | $(CC) $(CFLAGS) -x c -c -o $@ -

directories: $(NATIVE_BUILD_DIR) $(JS_BUILD_DIR)
	mkdir -p $(OUT) 2> /dev/null
	mkdir -p $(NATIVE_BUILD_DIR) 2> /dev/null;
	mkdir -p $(JS_BUILD_DIR) 2> /dev/null

v8:
	make -C $(VENDOR_DIR)/v8 \
	  CXX=$(CXX) \
	  LINK=$(CXX) \
	  $(TARGET)

