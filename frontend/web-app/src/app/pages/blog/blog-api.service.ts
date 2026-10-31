import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/api-base-url.token';
import { BlogPost, PaginatedBlogPosts } from './blog.models';
@Injectable({providedIn:'root'})
export class BlogApi {
 private readonly http=inject(HttpClient);private readonly api=inject(API_BASE_URL);
 list(page=1,search='',category=''){let params=new HttpParams().set('page',page);if(search)params=params.set('search',search);if(category)params=params.set('category',category);return this.http.get<PaginatedBlogPosts>(this.api+'/blog/posts/',{params});}
 detail(slug:string){return this.http.get<BlogPost>(this.api+'/blog/posts/'+encodeURIComponent(slug)+'/');}
}
