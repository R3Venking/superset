#!/usr/bin/env node
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// 获取所有 .po 文件
const translationsDir = path.join(__dirname, '../../superset/translations');
const pattern = path.join(translationsDir, '**/messages.po');

console.log('Building translations...');
console.log('Looking for .po files in:', translationsDir);

// 使用 glob 查找所有 .po 文件
const poFiles = glob.sync(pattern, { nodir: true });

if (poFiles.length === 0) {
  console.log('No .po files found!');
  process.exit(1);
}

console.log(`Found ${poFiles.length} .po files`);

// 处理每个 .po 文件
poFiles.forEach(file => {
  const jsonFile = file.replace('.po', '.json');
  const relativeFile = path.relative(process.cwd(), file);
  const relativeJsonFile = path.relative(process.cwd(), jsonFile);
  
  try {
    // 执行 po2json 命令
    const command = `npx po2json --domain superset --format jed1.x "${relativeFile}" "${relativeJsonFile}"`;
    console.log(`Converting: ${path.basename(path.dirname(path.dirname(file)))}/messages.po`);
    execSync(command, { stdio: 'inherit' });
    
    // 格式化生成的 JSON 文件
    try {
      execSync(`npx prettier --write "${relativeJsonFile}"`, { stdio: 'inherit' });
    } catch (prettierError) {
      console.warn(`Warning: Failed to format ${relativeJsonFile} with prettier`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('Translation build completed successfully!');