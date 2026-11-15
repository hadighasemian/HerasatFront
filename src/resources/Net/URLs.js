export default {
    'base':'https://back.aichat.salam-raya.ir/api/',
    'base1':'localhost/aichat/Back/public/api/',
    'auth':{
        'register':{
            'mobile':'auth/register/mobile',
            'confirm_code':'auth/register/confirm_code',
            'register':'auth/register/register',
        },
        'forget':{
            'mobile':'auth/forget/mobile',
            'confirm_code':'auth/forget/confirm_code',
            'pass':'auth/forget/pass',
        },
        'check_token':'auth/check_token',
        'login':'auth/login',
    },
    'dashboard':{
        'user':{
            'index':'dashboard/user',
            'store':'dashboard/user/store',
            'update':'dashboard/user/update',
            'delete':'dashboard/user/delete'

        },
        'assistant': {
            'files': {
                'index': 'dashboard/assistant/files',
                'store': 'dashboard/assistant/files/store',
                'update': 'dashboard/assistant/file/update',
                'delete': 'dashboard/assistant/files/delete'
            }
        },

    },

    'server':{
        'base':'https://back.aichat.salam-raya.ir/api',
        'auth':{
            'register':{
                'mobile':'auth/register/mobile',
                'confirm_code':'auth/register/confirm_code',
                'register':'auth/register/register',
            },
            'forget':{
                'mobile':'auth/forget/mobile',
                'confirm_code':'auth/forget/confirm_code',
                'pass':'auth/forget/pass',
            },
            'check_token':'auth/check_token',
            'login':'auth/login',
        },
        'openai':{
            'lib':{
                'assistant':{
                    'ask':'openai/lib/assistant/ask',
                },
                'image':'openai/lib/image',
            },
            'text':'openai/text',
            'image':'openai/image',
            'audio':{
                'speech':'audio/speech',
                'translations':'audio/translations',
                'transcriptions':'audio/transcriptions',
            },

        },
    },
    'openai':{
        'base':'https://api.openai.com/v1',
        'audio':{
            'speech':'audio/speech',
            'translations':'audio/translations',
            'transcriptions':'audio/transcriptions',
        },
    },

}

