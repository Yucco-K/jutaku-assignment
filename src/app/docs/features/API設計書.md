# API設計

### 【課題②】API設計書


| ルーター | エンドポイント | メソッド | 入力パラメータ | アウトプット | 認可 | 説明 |
| --- | --- | --- | --- | --- | --- | --- |
| appRouter | hello | query | なし | { msg: 'Hello World' } | - | "Hello World" メッセージを返す |
| userRouter | whoami | query | なし | { user: User } | 認証ユーザー | 現在のユーザー情報を取得 |
| projectRouter | list | query | なし | { projects: Project[] } | 認証ユーザー | 案件一覧を取得 |
| projectRouter | find | query | { id: string } | { project: Project } | 認証ユーザー | 案件詳細を取得 |
| projectRouter | create | mutation | { title, description, skillNames, price, deadline } | { project: Project } | 認証ユーザー | 新規案件を作成 |
| projectRouter | update | mutation | { id, title, description, skillNames, price, deadline } | { project: Project } | 認証ユーザー | 案件情報を更新 |
| projectRouter | delete | mutation | { id: string } | { success: boolean } | 管理者 | 案件を削除 |
| entryRouter | list | query | { status?, project_id? } | { entries: Entry[] } | 認証ユーザー | エントリー一覧を取得 |
| entryRouter | create | mutation | { project_id, user_id,, status } | { entry: Entry } | 認証ユーザー | エントリーを作成または更新 |
| entryRouter | update | mutation | { project_id, user_id, status? } | { entry: Entry } | 認証ユーザー | エントリーの状態を更新 |
| skillRouter | list | query | なし | { skills: Skill[] } | 認証ユーザー | スキル一覧を取得 |
| skillRouter | find | query | { name: string } | { skill: Skill } | 認証ユーザー | スキルを検索 |
